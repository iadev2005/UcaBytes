import { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function ImageUploader({ value, onChange, className, placeholder = 'Imagen' }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    // Subir a Firebase Storage y obtener URL pública
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `imagenes/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (err) {
      alert('Error al subir la imagen. Intenta de nuevo.');
      console.error(err);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    if (url) {
      onChange(url);
      setShowPreview(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative group border-2 border-dashed rounded-lg transition-all",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50",
          value ? "aspect-square" : "p-8"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={placeholder}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <button
                onClick={() => setShowPreview(true)}
                className="p-2 bg-white rounded-full hover:bg-gray-100 cursor-pointer"
                title="Cambiar imagen"
              >
                📝
              </button>
              <button
                onClick={() => onChange('')}
                className="p-2 bg-white rounded-full hover:bg-gray-100 cursor-pointer"
                title="Eliminar imagen"
              >
                🗑
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-2">🖼</div>
            <div className="text-sm font-medium mb-1">
              Arrastra una imagen aquí o
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                selecciona un archivo
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => setShowPreview(true)}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                introduce URL
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Cambiar imagen</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="url"
                  name="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 px-3 py-2 border rounded-md"
                  defaultValue={value}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Guardar
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
                  <div className="border-t border-gray-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500">o</span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-gray-300"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-4xl mb-2">📁</div>
                <div className="text-sm font-medium mb-1">
                  Arrastra una imagen aquí o
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  selecciona un archivo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
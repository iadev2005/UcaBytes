import React, { useState, useRef } from 'react';
import { client } from '../../supabase/client';
import { uploadCompanyImage } from '../../supabase/data';

interface ImageUploaderProps {
  onUploadComplete: (urls: string[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  className?: string;
  manualUrls?: string[]; // URLs manuales para mostrar en preview
  onRemoveManualUrl?: (index: number) => void; // Función para remover URL manual
  isCompanyUpload?: boolean; // Indica si es para subir imagen de empresa
  companyId?: number; // ID de la empresa (requerido si isCompanyUpload es true)
}

export default function ImageUploader({ 
  onUploadComplete, 
  multiple = true, 
  accept = "image/*,video/*",
  maxFiles = 10,
  className = "",
  manualUrls = [],
  onRemoveManualUrl,
  isCompanyUpload = false,
  companyId
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Verificar si ya se alcanzó el límite
    if (manualUrls.length >= maxFiles) {
      alert(`Ya tienes ${maxFiles} archivos. No puedes agregar más.`);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validar número máximo de archivos
    if (!multiple && files.length > 1) {
      alert('Solo puedes subir un archivo a la vez');
      return;
    }

    // Verificar límite total de archivos (solo manuales)
    const totalFiles = manualUrls.length;
    if (totalFiles + files.length > maxFiles) {
      alert(`Ya tienes ${totalFiles} archivos. Solo puedes agregar ${maxFiles - totalFiles} archivo${maxFiles - totalFiles > 1 ? 's' : ''} más.`);
      return;
    }

    if (files.length > maxFiles) {
      alert(`Puedes subir máximo ${maxFiles} archivos`);
      return;
    }

    // Validar tipos de archivo
    const validFiles = files.filter(file => {
      const isValidImage = file.type.startsWith('image/');
      const isValidVideo = file.type.startsWith('video/');
      return isValidImage || isValidVideo;
    });

    if (validFiles.length !== files.length) {
      alert('Algunos archivos no son imágenes o videos válidos');
      return;
    }

    // Validar que se proporcione companyId si es upload de empresa
    if (isCompanyUpload && !companyId) {
      alert('Error: Se requiere el ID de la empresa para subir imágenes de empresa');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      const uploadedUrls: string[] = [];
      const newPreviews: string[] = [];

      for (const file of validFiles) {
        // Crear preview
        const preview = URL.createObjectURL(file);
        newPreviews.push(preview);

        if (isCompanyUpload && companyId) {
          // Subir imagen de empresa
          const result = await uploadCompanyImage(file, companyId);
          
          if (result.success && result.url) {
            uploadedUrls.push(result.url);
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }));
          } else {
            throw new Error(`Error al subir ${file.name}: ${result.message}`);
          }
        } else {
          // Subir archivo normal a uploads
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          const fileExtension = file.name.split('.').pop() || 'jpg';
          const fileName = `avatars/${timestamp}-${randomId}.${fileExtension}`;

          const { data, error } = await client.storage
            .from('images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Error uploading file:', error);
            throw new Error(`Error al subir ${file.name}: ${error.message}`);
          }

          // Obtener URL pública
          const { data: urlData } = client.storage
            .from('images')
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) {
            uploadedUrls.push(urlData.publicUrl);
            setUploadProgress(prev => ({
              ...prev,
              [fileName]: 100
            }));
          }
        }
      }

      // No agregar a previews internos, solo notificar al componente padre
      onUploadComplete(uploadedUrls);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error al subir archivos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const removeFile = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    // También deberías remover la URL correspondiente del array de URLs
    // Esto requeriría manejar las URLs en el componente padre
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Área de drag and drop */}
      <div
        className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : manualUrls.length >= maxFiles
            ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 cursor-pointer'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={manualUrls.length >= maxFiles ? undefined : openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={manualUrls.length >= maxFiles}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-600">Subiendo archivos...</p>
          </div>
        ) : (manualUrls.length > 0) ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {/* Mostrar solo URLs manuales */}
              {manualUrls.map((url, index) => (
                <div key={`manual-${index}`} className="relative group">
                  {url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i) ? (
                    <video
                      src={url}
                      className="w-full h-24 object-cover rounded-lg"
                      controls
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`URL ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="absolute top-1 left-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded">
                    URL
                  </div>
                  {onRemoveManualUrl && (
                    <button
                      onClick={() => onRemoveManualUrl(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              {manualUrls.length} archivo{manualUrls.length > 1 ? 's' : ''} seleccionado{manualUrls.length > 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {manualUrls.length >= maxFiles 
                  ? 'Límite de archivos alcanzado' 
                  : 'Arrastra archivos aquí o haz clic para seleccionar'
                }
              </p>
              <p className="text-xs mt-1">
                {manualUrls.length >= maxFiles
                  ? `Ya tienes ${maxFiles} archivos seleccionados`
                  : `Imágenes y videos (máximo ${maxFiles} archivos)`
                }
              </p>
            </div>
          </div>
        )}
      </div>



      {/* Barra de progreso */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{fileName}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
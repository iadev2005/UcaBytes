import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { StyleConfig } from '../../types/templates';

type StyleEditorProps = {
  value: StyleConfig;
  onChange: (style: StyleConfig) => void;
  className?: string;
};

const COLORS = [
  { name: 'Negro', value: '#111111' },
  { name: 'Gris oscuro', value: '#1F2937' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Gris claro', value: '#D1D5DB' },
  { name: 'Blanco', value: '#FFFFFF' },
  { name: 'Blanco humo', value: '#F3F4F6' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Rojo claro', value: '#FCA5A5' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Rosa pastel', value: '#FBCFE8' },
  { name: 'Morado', value: '#8B5CF6' },
  { name: 'Morado claro', value: '#DDD6FE' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Azul claro', value: '#93C5FD' },
  { name: 'Cian', value: '#06B6D4' },
  { name: 'Cian claro', value: '#A5F3FC' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Verde claro', value: '#6EE7B7' },
  { name: 'Amarillo', value: '#F59E0B' },
  { name: 'Amarillo claro', value: '#FEF08A' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Naranja claro', value: '#FDBA74' },
  { name: 'Marrón', value: '#B45309' },
  { name: 'Marrón claro', value: '#FDE68A' },
];

export default function StyleEditor({ value, onChange, className }: StyleEditorProps) {
  const [activeTab, setActiveTab] = useState<'texto' | 'fondo'>('texto');

  const updateStyle = (updates: Partial<StyleConfig>) => {
    // Crear un nuevo objeto de estilo con los valores actualizados
    const newStyle = {
      ...value,
      ...updates
    };

    console.log('StyleEditor - Actualizando:', {
      actual: value,
      actualizaciones: updates,
      resultado: newStyle
    });

    onChange(newStyle);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg">
        {(['texto', 'fondo'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 min-w-[100px] px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === tab ? "bg-white shadow" : "hover:bg-white/50"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Panel de texto */}
      {activeTab === 'texto' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Color de texto</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateStyle({ textColor: color.value })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    value.textColor === color.value ? "border-primary scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Tamaño de fuente</label>
            <input
              type="range"
              min="12"
              max="72"
              step="1"
              value={value.fontSize || 16}
              onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>12px</span>
              <span>{value.fontSize || 16}px</span>
              <span>72px</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Peso de fuente</label>
            <select
              value={value.fontWeight || 400}
              onChange={(e) => updateStyle({ fontWeight: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Alineación</label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg">
              {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateStyle({ textAlign: align })}
                  className={cn(
                    "p-2 rounded text-center",
                    value.textAlign === align ? "bg-white shadow" : "hover:bg-white/50"
                  )}
                >
                  {align === 'left' && '⇤'}
                  {align === 'center' && '⇔'}
                  {align === 'right' && '⇥'}
                  {align === 'justify' && '⇱'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Panel de fondo */}
      {activeTab === 'fondo' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Color de fondo</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateStyle({ backgroundColor: color.value })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    value.backgroundColor === color.value ? "border-primary scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              <button
                onClick={() => updateStyle({ backgroundColor: 'transparent' })}
                className={cn(
                  "w-8 h-8 rounded-full border-2 border-dashed transition-all",
                  value.backgroundColor === 'transparent' ? "border-primary scale-110" : "border-gray-300 hover:scale-105"
                )}
                title="Transparente"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
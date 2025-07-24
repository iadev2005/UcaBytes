import { useState } from 'react';
import type { WebTemplate } from '../../types/templates';
import { cn } from '../../lib/utils';

type TemplateCardProps = {
  template: WebTemplate;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
};

const TemplateCard = ({ template, isSelected, onSelect }: TemplateCardProps) => {
  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden border-2 transition-all duration-300 cursor-pointer',
        'hover:border-primary hover:shadow-lg',
        isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'
      )}
      onClick={() => onSelect(template.id)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(template.id)}
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar plantilla ${template.name}`}
    >
      <div className="aspect-video relative">
        <img
          src={template.thumbnail}
          alt={`Vista previa de ${template.name}`}
          className="w-full h-full object-cover"
        />
        <div className={cn(
          'absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 transition-opacity',
          'group-hover:opacity-100'
        )}>
          <span className="text-white font-medium px-4 py-2 rounded-full bg-primary/90">
            Seleccionar Plantilla
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-3">
          Ideal para: {template.category}
        </p>
        <div className="flex flex-wrap gap-2">
          {template.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 rounded-full transition-colors hover:bg-[var(--color-primary-50)]"
            >
              {feature}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full transition-colors hover:bg-[var(--color-primary-50)]">
              +{template.features.length - 3} más
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

type TemplateGalleryProps = {
  templates: WebTemplate[];
  onTemplateSelect: (template: WebTemplate) => void;
};

const TemplateGallery = ({ templates, onTemplateSelect }: TemplateGalleryProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredTemplates = templates.filter(
    template => filter === 'all' || template.category === filter
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Selecciona una Plantilla
        </h2>
        <p className="text-gray-600">
          Elige la plantilla que mejor se adapte a tu negocio. Podrás personalizarla completamente después.
        </p>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                filter === category
                  ? 'bg-[var(--color-primary-600)] text-white'
                  : 'bg-gray-100 text-[var(--color-primary-700)] hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-900)]'
              )}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={template.id === selectedTemplateId}
            onSelect={handleTemplateSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery; 
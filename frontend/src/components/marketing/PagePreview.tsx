import type { BusinessPage, PageSection, StyleConfig } from '../../types/templates';
import { cn } from '../../lib/utils';

type SubElementKey =
  | 'title'
  | 'description'
  | 'backgroundImage'
  | 'button'
  | 'about-container'
  | 'content'
  | `feature-container-${number}`
  | `feature-title-${number}`
  | `feature-description-${number}`
  | `product-container-${number}`
  | `product-name-${number}`
  | `product-description-${number}`
  | `product-price-${number}`
  | `testimonial-container-${number}`
  | `testimonial-name-${number}`
  | `testimonial-role-${number}`
  | `testimonial-text-${number}`
  | `stat-container-${number}`;

type PagePreviewProps = {
  page: BusinessPage;
  onSectionSelect?: (sectionId: string) => void;
  selectedSectionId?: string;
  onSubElementDoubleClick?: (sectionId: string, key: SubElementKey) => void;
  selectedSubElement?: { sectionId: string, key: SubElementKey } | null;
  isEditor?: boolean;
};

const PagePreview = ({ page, onSectionSelect, selectedSectionId, onSubElementDoubleClick, selectedSubElement, isEditor = false }: PagePreviewProps) => {
  // Función simple para aplicar estilos
  const applyStyles = (styles?: StyleConfig): React.CSSProperties => {
    if (!styles) return {};

    const result: React.CSSProperties = {};

    // Aplicar estilos directamente
    if (styles.textColor) result.color = styles.textColor;
    if (styles.backgroundColor) result.backgroundColor = styles.backgroundColor;
    if (styles.fontSize) result.fontSize = `${styles.fontSize}px`;
    if (styles.fontWeight) result.fontWeight = styles.fontWeight;
    if (styles.textAlign) result.textAlign = styles.textAlign;
    if (styles.padding) result.padding = `${styles.padding}px`;
    if (styles.margin) result.margin = `${styles.margin}px`;
    if (styles.borderWidth) result.borderWidth = `${styles.borderWidth}px`;
    if (styles.borderColor) result.borderColor = styles.borderColor;
    if (styles.borderStyle) result.borderStyle = styles.borderStyle;
    if (styles.borderRadius) result.borderRadius = `${styles.borderRadius}px`;

    console.log('Estilos aplicados:', {
      entrada: styles,
      salida: result
    });

    return result;
  };

  const renderSection = (section: PageSection) => {
    switch (section.type) {
      case 'hero':
        return (
          <section style={applyStyles(section.content.style)}>
            <div className="relative py-20 overflow-hidden">
              {section.content.backgroundImage && (
                <div className="absolute inset-0">
                  <img
                    src={section.content.backgroundImage}
                    alt=""
                    className={cn(
                      "w-full h-full object-cover",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'backgroundImage' && 'ring-4 ring-primary-400 ring-offset-2 z-20'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'backgroundImage'); } : undefined}
                  />
                  {(section.content.style?.overlayOpacity ?? 0) > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: section.content.style?.overlayColor ?? '#000000',
                        opacity: section.content.style?.overlayOpacity ?? 0,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
              )}
              <div className="container mx-auto px-4 relative">
                <div className="max-w-3xl mx-auto text-center">
                  <h1 
                    style={applyStyles(section.content.titleStyle)}
                    className={cn(
                      "mb-6",
                      section.content.backgroundImage ? "text-white" : "text-gray-900",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'title' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'title'); } : undefined}
                  >
                    {section.content.title}
                  </h1>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className={cn(
                      section.content.backgroundImage ? "text-white/90" : "text-gray-600",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'description' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'description'); } : undefined}
                  >
                    {section.content.description}
                  </p>
                  {section.content.buttonText && (
                    <a
                      href={section.content.buttonLink}
                      style={applyStyles(section.content.buttonStyle)}
                      className={cn(
                        "inline-block px-8 py-3 mt-8 rounded-lg",
                        selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'button' && 'ring-2 ring-primary-400 ring-offset-2 z-20'
                      )}
                      onDoubleClick={onSubElementDoubleClick ? (e) => { e.preventDefault(); e.stopPropagation(); onSubElementDoubleClick(section.id, 'button'); } : undefined}
                    >
                      {section.content.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'features':
        return (
          <section style={applyStyles(section.content.style)}>
            <div className="relative py-8 md:py-16 overflow-hidden">
              {(section.content.style?.overlayOpacity ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: section.content.style?.overlayColor ?? '#000000',
                    opacity: section.content.style?.overlayOpacity ?? 0,
                    zIndex: 1,
                  }}
                />
              )}
              <div className={cn(
                'px-2 sm:px-4',
                typeof window !== 'undefined' && window.innerWidth <= 480 ? 'w-full' : 'container mx-auto'
              )}>
                <h2
                  style={applyStyles(section.content.titleStyle)}
                  className={cn(
                    'text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12',
                    selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'title' && 'ring-2 ring-primary-400'
                  )}
                  onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'title'); } : undefined}
                >
                  {section.content.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
                  {section.content.features.map((feature, index) => (
                    <div
                      key={index}
                      style={applyStyles(feature.style)}
                      className={cn(
                        "p-4 md:p-6 bg-white rounded-lg shadow-sm w-full h-full flex flex-col",
                        selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `feature-container-${index}` && 'ring-2 ring-primary-400'
                      )}
                      onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `feature-container-${index}` as any); } : undefined}
                    >
                      <h3
                        className={cn(
                          'text-lg md:text-xl font-semibold mb-2 md:mb-3',
                          selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `feature-title-${index}` && 'ring-2 ring-primary-400'
                        )}
                        onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `feature-title-${index}` as any); } : undefined}
                      >
                        {feature.title}
                      </h3>
                      <p
                        className={cn(
                          'text-gray-600 text-sm md:text-base flex-1',
                          selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `feature-description-${index}` && 'ring-2 ring-primary-400'
                        )}
                        onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `feature-description-${index}` as any); } : undefined}
                      >
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'products':
        return (
          <section style={applyStyles(section.content.style)}>
            <div className="relative py-8 md:py-16 overflow-hidden">
              {(section.content.style?.overlayOpacity ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: section.content.style?.overlayColor ?? '#000000',
                    opacity: section.content.style?.overlayOpacity ?? 0,
                    zIndex: 1,
                  }}
                />
              )}
              <div className={cn(
                'px-2 sm:px-4',
                typeof window !== 'undefined' && window.innerWidth <= 480 ? 'w-full' : 'container mx-auto'
              )}>
                <div className="text-center mb-8 md:mb-12">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className={cn(
                      "text-2xl md:text-3xl font-bold mb-2 md:mb-4",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'title' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'title'); } : undefined}
                  >
                    {section.content.title}
                  </h2>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className={cn(
                      "text-base md:text-xl text-gray-600",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'description' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'description'); } : undefined}
                  >
                    {section.content.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
                  {section.content.products.map((product, index) => (
                    <div 
                      key={index} 
                      style={applyStyles(product.style)}
                      className={cn(
                        "bg-white rounded-lg shadow-sm overflow-hidden w-full flex flex-col",
                        selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `product-container-${index}` && 'ring-2 ring-primary-400'
                      )}
                      onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `product-container-${index}` as any); } : undefined}
                    >
                      {product.image && (
                        <div className="aspect-square w-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 md:p-6 flex-1 flex flex-col">
                        <h3
                          className={cn(
                            "text-lg md:text-xl font-semibold mb-1 md:mb-2",
                            selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `product-name-${index}` && 'ring-2 ring-primary-400'
                          )}
                          onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `product-name-${index}` as any); } : undefined}
                        >
                          {product.name}
                        </h3>
                        <p
                          className={cn(
                            "text-gray-600 text-sm md:text-base mb-2 flex-1",
                            selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `product-description-${index}` && 'ring-2 ring-primary-400'
                          )}
                          onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `product-description-${index}` as any); } : undefined}
                        >
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span
                            className={cn(
                              "text-base md:text-lg font-bold text-primary",
                              selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `product-price-${index}` && 'ring-2 ring-primary-400'
                            )}
                            onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `product-price-${index}` as any); } : undefined}
                          >
                            ${product.price.toFixed(2)}
                          </span>
                          <button className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg text-xs md:text-base">
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section style={applyStyles(section.content.style)}>
            <div className="relative py-8 md:py-16 overflow-hidden">
              {(section.content.style?.overlayOpacity ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: section.content.style?.overlayColor ?? '#000000',
                    opacity: section.content.style?.overlayOpacity ?? 0,
                    zIndex: 1,
                  }}
                />
              )}
              <div className={cn(
                'px-2 sm:px-4',
                typeof window !== 'undefined' && window.innerWidth <= 480 ? 'w-full' : 'container mx-auto'
              )}>
                <div className="text-center mb-8 md:mb-12">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className={cn(
                      "text-2xl md:text-3xl font-bold mb-2 md:mb-4",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'title' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'title'); } : undefined}
                  >
                    {section.content.title}
                  </h2>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className={cn(
                      "text-base md:text-xl text-gray-600",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'description' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'description'); } : undefined}
                  >
                    {section.content.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 relative z-10">
                  {section.content.testimonials.map((testimonial, index) => (
                    <div 
                      key={index} 
                      style={applyStyles(testimonial.style)}
                      className={cn(
                        "bg-white p-4 md:p-6 rounded-lg shadow-sm w-full flex flex-col",
                        selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `testimonial-container-${index}` && 'ring-2 ring-primary-400'
                      )}
                      onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `testimonial-container-${index}` as any); } : undefined}
                    >
                      <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                        {testimonial.image && (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3
                            className={cn(
                              "font-semibold text-sm md:text-base",
                              selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `testimonial-name-${index}` && 'ring-2 ring-primary-400'
                            )}
                            onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `testimonial-name-${index}` as any); } : undefined}
                          >
                            {testimonial.name}
                          </h3>
                          <p
                            className={cn(
                              "text-xs md:text-sm text-gray-600",
                              selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `testimonial-role-${index}` && 'ring-2 ring-primary-400'
                            )}
                            onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `testimonial-role-${index}` as any); } : undefined}
                          >
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-gray-600 italic text-sm md:text-base flex-1",
                          selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `testimonial-text-${index}` && 'ring-2 ring-primary-400'
                        )}
                        onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `testimonial-text-${index}` as any); } : undefined}
                      >
                        "{testimonial.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );

      case 'about':
        return (
          <section style={applyStyles(section.content.style)}>
            <div className="relative py-16 overflow-hidden">
              {(section.content.style?.overlayOpacity ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: section.content.style?.overlayColor ?? '#000000',
                    opacity: section.content.style?.overlayOpacity ?? 0,
                    zIndex: 1,
                  }}
                />
              )}
              <div className={cn(
                "container mx-auto px-4",
                selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'about-container' && 'ring-2 ring-primary-400'
              )}
                onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'about-container'); } : undefined}
              >
                <div className="max-w-3xl mx-auto">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className={cn(
                      "text-3xl font-bold mb-6 text-center",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'title' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'title'); } : undefined}
                  >
                    {section.content.title}
                  </h2>
                  <div 
                    style={applyStyles(section.content.contentStyle)}
                    className={cn(
                      "prose prose-lg mx-auto",
                      selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === 'content' && 'ring-2 ring-primary-400'
                    )}
                    onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, 'content'); } : undefined}
                  >
                    {section.content.content}
                  </div>
                  {section.content.stats && section.content.stats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                      {section.content.stats.map((stat, index) => (
                        <div
                          key={index}
                          style={applyStyles(stat.style)}
                          className={cn(
                            "text-center",
                            selectedSubElement && selectedSubElement.sectionId === section.id && selectedSubElement.key === `stat-container-${index}` && 'ring-2 ring-primary-400'
                          )}
                          onDoubleClick={onSubElementDoubleClick ? (e) => { e.stopPropagation(); onSubElementDoubleClick(section.id, `stat-container-${index}` as any); } : undefined}
                        >
                          <div className="text-3xl font-bold text-primary mb-2">
                            {stat.value}
                          </div>
                          <div className="text-sm text-gray-600">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section style={applyStyles(section.content.style)}>
            <div className="relative py-16 overflow-hidden">
              {(section.content.style?.overlayOpacity ?? 0) > 0 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: section.content.style?.overlayColor ?? '#000000',
                    opacity: section.content.style?.overlayOpacity ?? 0,
                    zIndex: 1,
                  }}
                />
              )}
              <div className="container mx-auto px-4">
                <div className="max-w-xl mx-auto">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className="text-3xl font-bold mb-8 text-center"
                  >
                    {section.content.title || 'Contáctanos'}
                  </h2>
                  <div 
                    style={applyStyles(section.content.contentStyle)}
                    className="bg-white rounded-lg shadow-sm p-8"
                  >
                    <div className="space-y-6">
                      {section.content.email && (
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📧</span>
                          <div>
                            <div className="font-medium">Email</div>
                            <a href={`mailto:${section.content.email}`} className="text-primary">
                              {section.content.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {section.content.phone && (
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📞</span>
                          <div>
                            <div className="font-medium">Teléfono</div>
                            <a href={`tel:${section.content.phone}`} className="text-primary">
                              {section.content.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {section.content.address && (
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📍</span>
                          <div>
                            <div className="font-medium">Dirección</div>
                            <div className="text-gray-600">
                              {section.content.address}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {section.content.mapEmbed && (
                      <div className="mt-8 rounded-lg overflow-hidden">
                        <div dangerouslySetInnerHTML={{ __html: section.content.mapEmbed }} />
                      </div>
                    )}

                    {section.content.showSocialMedia && section.content.socialLinks && (
                      <div className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-medium mb-4">Síguenos en redes sociales</h3>
                        <div className="flex gap-4">
                          {section.content.socialLinks.facebook && (
                            <a
                              href={section.content.socialLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xl hover:text-primary"
                            >
                              📘
                            </a>
                          )}
                          {section.content.socialLinks.instagram && (
                            <a
                              href={section.content.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xl hover:text-primary"
                            >
                              📸
                            </a>
                          )}
                          {section.content.socialLinks.twitter && (
                            <a
                              href={section.content.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xl hover:text-primary"
                            >
                              🐦
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'mx-auto bg-white shadow-lg transition-all',
        'max-w-6xl'
      )}
      style={{
        fontFamily:
          page.content.theme.fontFamily === 'syne'
            ? 'var(--font-syne)'
            : page.content.theme.fontFamily === 'arial'
            ? 'Arial, Helvetica, system-ui, sans-serif'
            : page.content.theme.fontFamily === 'georgia'
            ? 'Georgia, Times New Roman, serif'
            : 'Courier New, Consolas, monospace',
      }}
    >
      {page.content.sections
        .sort((a, b) => a.order - b.order)
        .map(section => (
          <div
            key={section.id}
            {...(isEditor && onSectionSelect ? { onClick: (e) => { e.stopPropagation(); onSectionSelect(section.id); } } : {})}
            className={cn(
              isEditor && 'cursor-pointer group',
              selectedSectionId === section.id && 'ring-4 ring-primary/60 z-10 relative'
            )}
            style={{ position: 'relative' }}
          >
            {renderSection(section)}
            {selectedSectionId === section.id && isEditor && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">
                Seleccionado
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default PagePreview; 
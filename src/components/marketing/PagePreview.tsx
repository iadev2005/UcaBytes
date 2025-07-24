import type { BusinessPage, PageSection, StyleConfig } from '../../types/templates';
import { cn } from '../../lib/utils';

type PagePreviewProps = {
  page: BusinessPage;
  onSectionSelect?: (sectionId: string) => void;
  selectedSectionId?: string;
};

const PagePreview = ({ page, onSectionSelect, selectedSectionId }: PagePreviewProps) => {
  const { theme } = page.content;

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
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
              )}
              <div className="container mx-auto px-4 relative">
                <div className="max-w-3xl mx-auto text-center">
                  <h1 
                    style={applyStyles(section.content.titleStyle)}
                    className={cn(
                      "mb-6",
                      section.content.backgroundImage ? "text-white" : "text-gray-900"
                    )}
                  >
                    {section.content.title}
                  </h1>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className={cn(
                      section.content.backgroundImage ? "text-white/90" : "text-gray-600"
                    )}
                  >
                    {section.content.description}
                  </p>
                  {section.content.buttonText && (
                    <a
                      href={section.content.buttonLink}
                      style={applyStyles(section.content.buttonStyle)}
                      className="inline-block px-8 py-3 mt-8 rounded-lg"
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
            <div className="py-8 md:py-16 bg-gray-50">
              <div className={cn(
                'px-2 sm:px-4',
                typeof window !== 'undefined' && window.innerWidth <= 480 ? 'w-full' : 'container mx-auto'
              )}>
                <h2 
                  style={applyStyles(section.content.titleStyle)}
                  className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12"
                >
                  {section.content.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {section.content.features.map((feature, index) => (
                    <div
                      key={index}
                      style={applyStyles(feature.style)}
                      className="p-4 md:p-6 bg-white rounded-lg shadow-sm w-full h-full flex flex-col"
                    >
                      <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base flex-1">
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
            <div className="py-8 md:py-16">
              <div className={cn(
                'px-2 sm:px-4',
                typeof window !== 'undefined' && window.innerWidth <= 480 ? 'w-full' : 'container mx-auto'
              )}>
                <div className="text-center mb-8 md:mb-12">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className="text-2xl md:text-3xl font-bold mb-2 md:mb-4"
                  >
                    {section.content.title}
                  </h2>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className="text-base md:text-xl text-gray-600"
                  >
                    {section.content.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {section.content.products.map((product, index) => (
                    <div 
                      key={index} 
                      style={applyStyles(product.style)}
                      className="bg-white rounded-lg shadow-sm overflow-hidden w-full flex flex-col"
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
                        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm md:text-base mb-2 flex-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-base md:text-lg font-bold text-primary">
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
            <div className="py-8 md:py-16 bg-gray-50">
              <div className={cn(
                'px-2 sm:px-4',
                typeof window !== 'undefined' && window.innerWidth <= 480 ? 'w-full' : 'container mx-auto'
              )}>
                <div className="text-center mb-8 md:mb-12">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className="text-2xl md:text-3xl font-bold mb-2 md:mb-4"
                  >
                    {section.content.title}
                  </h2>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className="text-base md:text-xl text-gray-600"
                  >
                    {section.content.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                  {section.content.testimonials.map((testimonial, index) => (
                    <div 
                      key={index} 
                      style={applyStyles(testimonial.style)}
                      className="bg-white p-4 md:p-6 rounded-lg shadow-sm w-full flex flex-col"
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
                          <h3 className="font-semibold text-sm md:text-base">{testimonial.name}</h3>
                          <p className="text-xs md:text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic text-sm md:text-base flex-1">"{testimonial.text}"</p>
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
            <div className="py-16">
              <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className="text-3xl font-bold mb-6 text-center"
                  >
                    {section.content.title}
                  </h2>
                  <div 
                    style={applyStyles(section.content.contentStyle)}
                    className="prose prose-lg mx-auto"
                  >
                    {section.content.content}
                  </div>
                  {section.content.stats && section.content.stats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                      {section.content.stats.map((stat, index) => (
                        <div 
                          key={index} 
                          style={applyStyles(stat.style)}
                          className="text-center"
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
            <div className="py-16 bg-gray-50">
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
    >
      {page.content.sections
        .sort((a, b) => a.order - b.order)
        .map(section => (
          <div
            key={section.id}
            onClick={onSectionSelect ? (e) => { e.stopPropagation(); onSectionSelect(section.id); } : undefined}
            className={cn(
              'cursor-pointer group',
              selectedSectionId === section.id && 'ring-4 ring-primary/60 z-10 relative'
            )}
            style={{ position: 'relative' }}
          >
            {renderSection(section)}
            {selectedSectionId === section.id && (
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
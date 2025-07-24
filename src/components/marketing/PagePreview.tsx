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
            <div className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <h2 
                  style={applyStyles(section.content.titleStyle)}
                  className="text-3xl font-bold text-center mb-12"
                >
                  {section.content.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {section.content.features.map((feature, index) => (
                    <div
                      key={index}
                      style={applyStyles(feature.style)}
                      className="p-6 bg-white rounded-lg shadow-sm"
                    >
                      <h3 className="text-xl font-semibold mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
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
            <div className="py-16">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className="text-3xl font-bold mb-4"
                  >
                    {section.content.title}
                  </h2>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className="text-xl text-gray-600"
                  >
                    {section.content.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {section.content.products.map((product, index) => (
                    <div 
                      key={index} 
                      style={applyStyles(product.style)}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      {product.image && (
                        <div className="aspect-square">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <button className="px-4 py-2 bg-primary text-white rounded-lg">
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
            <div className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 
                    style={applyStyles(section.content.titleStyle)}
                    className="text-3xl font-bold mb-4"
                  >
                    {section.content.title}
                  </h2>
                  <p 
                    style={applyStyles(section.content.descriptionStyle)}
                    className="text-xl text-gray-600"
                  >
                    {section.content.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {section.content.testimonials.map((testimonial, index) => (
                    <div 
                      key={index} 
                      style={applyStyles(testimonial.style)}
                      className="bg-white p-6 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {testimonial.image && (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 italic">"{testimonial.text}"</p>
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
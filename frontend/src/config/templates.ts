import type { WebTemplate } from '../types/templates';

const defaultStyles = {
  titleStyle: {
    fontSize: 48,
    fontWeight: 700,
    textAlign: 'center' as const,
    color: '#1F2937'
  },
  descriptionStyle: {
    fontSize: 20,
    fontWeight: 400,
    textAlign: 'center' as const,
    color: '#4B5563'
  },
  buttonStyle: {
    fontSize: 16,
    fontWeight: 500,
    textAlign: 'center' as const,
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8
  }
};

export const WEBSITE_TEMPLATES: WebTemplate[] = [
  {
    id: 'restaurant',
    name: 'Restaurante',
    category: 'restaurant',
    thumbnail: '/templates/restaurant-modern.jpg',
    features: [
      'Menú digital',
      'Reservas online',
      'Galería de platos',
      'Información de contacto',
      'Testimonios de clientes'
    ],
    defaultTheme: {
      primaryColor: '#D4B996',
      secondaryColor: '#594545',
      fontFamily: 'georgia',
      headerStyle: 'standard',
      footerStyle: 'detailed'
    },
    defaultSections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          title: 'Bienvenidos a nuestro restaurante',
          description: 'Una experiencia culinaria única',
          features: [],
          products: [],
          testimonials: [],
          stats: [],
          titleStyle: defaultStyles.titleStyle,
          descriptionStyle: defaultStyles.descriptionStyle,
          buttonStyle: defaultStyles.buttonStyle,
          style: {
            backgroundColor: '#FFFFFF'
          }
        },
        isVisible: true,
        order: 0
      },
      {
        id: 'features',
        type: 'features',
        content: {
          title: 'Por qué elegirnos',
          features: [
            { 
              title: 'Ingredientes frescos',
              description: 'Seleccionamos los mejores ingredientes locales',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            },
            { 
              title: 'Chef experto',
              description: 'Más de 15 años de experiencia culinaria',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            },
            { 
              title: 'Ambiente acogedor',
              description: 'Un espacio diseñado para tu comodidad',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            }
          ],
          products: [],
          testimonials: [],
          stats: [],
          titleStyle: defaultStyles.titleStyle,
          style: {
            backgroundColor: '#F9FAFB',
            padding: 64
          }
        },
        isVisible: true,
        order: 1
      }
    ]
  },
  {
    id: 'retail',
    name: 'Tienda',
    category: 'retail',
    thumbnail: '/templates/retail-boutique.jpg',
    features: [
      'Catálogo de productos',
      'Carrito de compras',
      'Galería de imágenes',
      'Información de envíos',
      'Testimonios de clientes'
    ],
    defaultTheme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      fontFamily: 'syne',
      headerStyle: 'standard',
      footerStyle: 'detailed'
    },
    defaultSections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          title: 'Tu tienda online',
          description: 'Los mejores productos a un clic de distancia',
          features: [],
          products: [],
          testimonials: [],
          stats: [],
          titleStyle: defaultStyles.titleStyle,
          descriptionStyle: defaultStyles.descriptionStyle,
          buttonStyle: defaultStyles.buttonStyle,
          style: {
            backgroundColor: '#FFFFFF'
          }
        },
        isVisible: true,
        order: 0
      },
      {
        id: 'features',
        type: 'features',
        content: {
          title: 'Nuestras ventajas',
          features: [
            { 
              title: 'Envío rápido',
              description: 'Recibe tus productos en 24-48 horas',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            },
            { 
              title: 'Calidad garantizada',
              description: 'Todos nuestros productos pasan control de calidad',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            },
            { 
              title: 'Atención personalizada',
              description: 'Nuestro equipo está disponible para ayudarte',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            }
          ],
          products: [],
          testimonials: [],
          stats: [],
          titleStyle: defaultStyles.titleStyle,
          style: {
            backgroundColor: '#F9FAFB',
            padding: 64
          }
        },
        isVisible: true,
        order: 1
      }
    ]
  },
  {
    id: 'professional',
    name: 'Profesional',
    category: 'professional',
    thumbnail: '/templates/professional-services.jpg',
    features: [
      'Portafolio',
      'Blog',
      'Servicios',
      'Formulario de contacto',
      'Integración con redes sociales'
    ],
    defaultTheme: {
      primaryColor: '#1F2937',
      secondaryColor: '#4B5563',
      fontFamily: 'syne',
      headerStyle: 'standard',
      footerStyle: 'detailed'
    },
    defaultSections: [
      {
        id: 'hero',
        type: 'hero',
        content: {
          title: 'Servicios profesionales',
          description: 'Soluciones a medida para tu negocio',
          features: [],
          products: [],
          testimonials: [],
          stats: [],
          titleStyle: defaultStyles.titleStyle,
          descriptionStyle: defaultStyles.descriptionStyle,
          buttonStyle: defaultStyles.buttonStyle,
          style: {
            backgroundColor: '#FFFFFF'
          }
        },
        isVisible: true,
        order: 0
      },
      {
        id: 'features',
        type: 'features',
        content: {
          title: 'Nuestros servicios',
          features: [
            { 
              title: 'Consultoría especializada',
              description: 'Análisis detallado y recomendaciones personalizadas',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            },
            { 
              title: 'Desarrollo de proyectos',
              description: 'Implementación completa de soluciones empresariales',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            },
            { 
              title: 'Soporte continuo',
              description: 'Acompañamiento y mantenimiento post-implementación',
              style: {
                backgroundColor: '#FFFFFF',
                padding: 24,
                borderRadius: 8
              }
            }
          ],
          products: [],
          testimonials: [],
          stats: [],
          titleStyle: defaultStyles.titleStyle,
          style: {
            backgroundColor: '#F9FAFB',
            padding: 64
          }
        },
        isVisible: true,
        order: 1
      }
    ]
  }
]; 
import type { WebTemplate } from '../types/templates';

export const WEBSITE_TEMPLATES: WebTemplate[] = [
  {
    id: 'restaurant-modern',
    name: 'Restaurante Moderno',
    category: 'restaurant',
    thumbnail: '/templates/restaurant-modern.jpg',
    features: [
      'Menú digital interactivo',
      'Sistema de reservas en línea',
      'Galería de platos',
      'Testimonios de clientes',
      'Integración con redes sociales',
      'Mapa de ubicación'
    ],
    defaultTheme: {
      primaryColor: '#D4B996',
      secondaryColor: '#594545',
      fontFamily: 'sans',
      headerStyle: 'hero',
      footerStyle: 'detailed'
    },
    defaultSections: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Bienvenidos a nuestro restaurante',
          description: 'Una experiencia culinaria única que deleitará tus sentidos'
        },
        isVisible: true,
        order: 0
      },
      {
        id: 'features-1',
        type: 'features',
        content: {
          features: [
            { title: 'Cocina de autor', description: 'Platos únicos y creativos' },
            { title: 'Ingredientes locales', description: 'De la granja a la mesa' },
            { title: 'Ambiente acogedor', description: 'Diseño moderno y cálido' }
          ]
        },
        isVisible: true,
        order: 1
      }
    ]
  },
  {
    id: 'retail-boutique',
    name: 'Boutique Elegante',
    category: 'retail',
    thumbnail: '/templates/retail-boutique.jpg',
    features: [
      'Catálogo de productos',
      'Carrito de compras',
      'Galería de fotos',
      'Newsletter',
      'Filtros de búsqueda',
      'Reseñas de productos'
    ],
    defaultTheme: {
      primaryColor: '#DFD3C3',
      secondaryColor: '#596E79',
      fontFamily: 'serif',
      headerStyle: 'minimal',
      footerStyle: 'simple'
    },
    defaultSections: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Moda exclusiva para ti',
          description: 'Descubre nuestra nueva colección'
        },
        isVisible: true,
        order: 0
      }
    ]
  },
  {
    id: 'professional-services',
    name: 'Servicios Profesionales',
    category: 'services',
    thumbnail: '/templates/professional-services.jpg',
    features: [
      'Portafolio de servicios',
      'Formulario de contacto',
      'Calendario de citas',
      'Blog integrado',
      'Testimonios de clientes',
      'Equipo profesional'
    ],
    defaultTheme: {
      primaryColor: '#2C3E50',
      secondaryColor: '#E74C3C',
      fontFamily: 'sans',
      headerStyle: 'standard',
      footerStyle: 'detailed'
    },
    defaultSections: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Soluciones profesionales a tu medida',
          description: 'Expertos en hacer crecer tu negocio'
        },
        isVisible: true,
        order: 0
      }
    ]
  },
  {
    id: 'tech-startup',
    name: 'Startup Tecnológica',
    category: 'professional',
    thumbnail: '/templates/tech-startup.jpg',
    features: [
      'Diseño minimalista',
      'Animaciones modernas',
      'Integración API',
      'Panel de precios',
      'Demo interactiva',
      'Chat en vivo'
    ],
    defaultTheme: {
      primaryColor: '#6C63FF',
      secondaryColor: '#2F2E41',
      fontFamily: 'sans',
      headerStyle: 'minimal',
      footerStyle: 'simple'
    },
    defaultSections: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Innovación que transforma',
          description: 'Tecnología del futuro, hoy'
        },
        isVisible: true,
        order: 0
      }
    ]
  }
]; 
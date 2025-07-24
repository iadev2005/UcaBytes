import type { BusinessPage, PageSection } from '../../types/templates';
import { cn } from '../../lib/utils';

type PagePreviewProps = {
  page: BusinessPage;
};

const SectionPreview = ({ section }: { section: PageSection }) => {
  if (!section.isVisible) return null;

  switch (section.type) {
    case 'hero':
      return (
        <section className="relative py-20 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {section.content.title}
              </h1>
              <p className="text-xl text-gray-600">
                {section.content.description}
              </p>
            </div>
          </div>
        </section>
      );

    case 'features':
      return (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {section.content.features?.map((feature: any, index: number) => (
                <div
                  key={index}
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
        </section>
      );

    case 'about':
      return (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">
                {section.content.title}
              </h2>
              <div className="prose prose-lg mx-auto">
                {section.content.content}
              </div>
            </div>
          </div>
        </section>
      );

    case 'contact':
      return (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {section.content.title || 'Contáctanos'}
              </h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="Tu nombre"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border rounded-md"
                    placeholder="tu@email.com"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mensaje
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-md"
                    rows={4}
                    placeholder="Tu mensaje"
                    disabled
                  />
                </div>
                <button
                  type="button"
                  className="w-full px-6 py-3 bg-primary text-white rounded-md opacity-50 cursor-not-allowed"
                  disabled
                >
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </section>
      );

    default:
      return null;
  }
};

const PagePreview = ({ page }: PagePreviewProps) => {
  const { theme } = page.content;

  return (
    <div
      className="min-h-screen"
      style={{
        '--primary-color': theme.primaryColor,
        '--secondary-color': theme.secondaryColor,
        fontFamily: {
          sans: 'ui-sans-serif, system-ui, sans-serif',
          serif: 'ui-serif, Georgia, serif',
          mono: 'ui-monospace, monospace'
        }[theme.fontFamily]
      } as any}
    >
      <header
        className={cn(
          'bg-white border-b sticky top-0 z-50',
          theme.headerStyle === 'minimal' ? 'py-4' : 'py-6'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">
              {page.businessName || 'Nombre del Negocio'}
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Inicio
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Servicios
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {page.content.sections
          .sort((a, b) => a.order - b.order)
          .map(section => (
            <SectionPreview key={section.id} section={section} />
          ))}
      </main>

      <footer
        className={cn(
          'bg-gray-900 text-white',
          theme.footerStyle === 'simple' ? 'py-8' : 'py-16'
        )}
      >
        <div className="container mx-auto px-4">
          {theme.footerStyle === 'simple' ? (
            <div className="text-center">
              <p className="text-gray-400">
                © {new Date().getFullYear()} {page.businessName || 'Tu Negocio'}. 
                Todos los derechos reservados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {page.businessName || 'Tu Negocio'}
                </h3>
                <p className="text-gray-400">
                  Creando experiencias únicas para nuestros clientes.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Inicio
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Servicios
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Contacto
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>contact@tudominio.com</li>
                  <li>+58 (XXX) XXX-XXXX</li>
                  <li>Venezuela</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
                <div className="flex gap-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    Facebook
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Instagram
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Twitter
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default PagePreview; 
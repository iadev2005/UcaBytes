import { useState } from 'react';
import WebsiteBuilder from '../components/marketing/WebsiteBuilder';

type MarketingTool = 'website-builder' | 'social-media' | 'email' | 'analytics';

export default function Marketing() {
  const [selectedTool, setSelectedTool] = useState<MarketingTool | null>(null);

  const tools = [
    {
      id: 'website-builder' as MarketingTool,
      name: 'Generador de Sitios Web',
      description: 'Crea sitios web profesionales para PyMEs en minutos',
      icon: '🌐'
    },
    {
      id: 'social-media' as MarketingTool,
      name: 'Gestión de Redes Sociales',
      description: 'Programa y gestiona tus publicaciones en redes sociales',
      icon: '📱'
    },
    {
      id: 'email' as MarketingTool,
      name: 'Marketing por Email',
      description: 'Crea y envía campañas de email marketing',
      icon: '📧'
    },
    {
      id: 'analytics' as MarketingTool,
      name: 'Analíticas',
      description: 'Analiza el rendimiento de tus campañas de marketing',
      icon: '📊'
    }
  ];

  if (selectedTool === 'website-builder') {
    return <WebsiteBuilder />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-primary-700)] mb-4">
            Marketing Digital
          </h1>
          <p className="text-lg text-gray-600">
            Herramientas profesionales para impulsar tu presencia digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className="bg-white rounded-xl shadow-lg p-6 text-left transition-transform hover:scale-105 hover:shadow-xl"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h2 className="text-xl font-semibold mb-2 text-[var(--color-primary-700)]">
                {tool.name}
              </h2>
              <p className="text-gray-600">
                {tool.description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary-700)]">
            Estadísticas Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Sitios Web Activos</p>
              <p className="text-3xl font-bold text-[var(--color-primary-700)]">12</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Campañas de Email</p>
              <p className="text-3xl font-bold text-[var(--color-primary-700)]">5</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-1">Posts Programados</p>
              <p className="text-3xl font-bold text-[var(--color-primary-700)]">24</p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-[var(--color-primary-700)]">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {[
              {
                action: 'Sitio web publicado',
                target: 'Restaurante El Sabor',
                time: 'Hace 2 horas'
              },
              {
                action: 'Campaña de email enviada',
                target: 'Promoción de Verano',
                time: 'Hace 5 horas'
              },
              {
                action: 'Post programado',
                target: 'Instagram',
                time: 'Hace 1 día'
              }
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.target}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

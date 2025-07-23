import { 
  HomeIcon,
  AutomationIcon,
  OperationsIcon,
  ServicesIcon,
  MegaphoneIcon,
  ReturnIcon,
  NotificationIcon
} from './icons'

function App() {
  const icons = [
    { Icon: HomeIcon, name: 'Home' },
    { Icon: AutomationIcon, name: 'Automation' },
    { Icon: OperationsIcon, name: 'Operations' },
    { Icon: ServicesIcon, name: 'Services' },
    { Icon: MegaphoneIcon, name: 'Megaphone' },
    { Icon: ReturnIcon, name: 'Return' },
    { Icon: NotificationIcon, name: 'Notification' }
  ]

  const colorPalette = {
    primary: [
      { name: '50', color: 'var(--color-primary-50)' },
      { name: '100', color: 'var(--color-primary-100)' },
      { name: '200', color: 'var(--color-primary-200)' },
      { name: '300', color: 'var(--color-primary-300)' },
      { name: '400', color: 'var(--color-primary-400)' },
      { name: '500', color: 'var(--color-primary-500)' },
      { name: '600', color: 'var(--color-primary-600)' },
      { name: '700', color: 'var(--color-primary-700)' },
      { name: '800', color: 'var(--color-primary-800)' },
      { name: '900', color: 'var(--color-primary-900)' }
    ],
    secondary: [
      { name: '50', color: 'var(--color-secondary-50)' },
      { name: '100', color: 'var(--color-secondary-100)' },
      { name: '200', color: 'var(--color-secondary-200)' },
      { name: '300', color: 'var(--color-secondary-300)' },
      { name: '400', color: 'var(--color-secondary-400)' },
      { name: '500', color: 'var(--color-secondary-500)' },
      { name: '600', color: 'var(--color-secondary-600)' },
      { name: '700', color: 'var(--color-secondary-700)' },
      { name: '800', color: 'var(--color-secondary-800)' },
      { name: '900', color: 'var(--color-secondary-900)' }
    ]
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      {/* Header */}
      <header className="py-12 px-8" style={{ backgroundColor: 'var(--color-primary-600)' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-extrabold text-white mb-4">UcaBytes</h1>
          <p className="text-xl text-white/80">Guía de Estilo y Sistema de Diseño</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12 space-y-16">
        {/* Paleta de Colores */}
        <section>
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-primary-600)' }}>Paleta de Colores</h2>
          
          <div className="space-y-8">
            {/* Colores Base */}
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-6 rounded-lg flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <div>
                  <h3 className="font-bold mb-1">Background</h3>
                  <code className="text-sm opacity-70">#FFFAFF</code>
                </div>
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--color-background)' }} />
              </div>
              <div 
                className="p-6 rounded-lg flex items-center justify-between text-white"
                style={{ backgroundColor: 'var(--color-text)' }}
              >
                <div>
                  <h3 className="font-bold mb-1">Text</h3>
                  <code className="text-sm opacity-70">#1E1B15</code>
                </div>
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: 'var(--color-text)' }} />
              </div>
            </div>

            {/* Colores Primarios */}
            <div>
              <h3 className="text-xl font-bold mb-4">Primarios</h3>
              <div className="grid grid-cols-5 gap-4">
                {colorPalette.primary.map((color) => (
                  <div 
                    key={color.name}
                    className="p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-center"
                    style={{ 
                      backgroundColor: color.color,
                      color: parseInt(color.name) > 400 ? 'white' : 'var(--color-text)'
                    }}
                  >
                    <span className="font-bold">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Colores Secundarios */}
            <div>
              <h3 className="text-xl font-bold mb-4">Secundarios</h3>
              <div className="grid grid-cols-5 gap-4">
                {colorPalette.secondary.map((color) => (
                  <div 
                    key={color.name}
                    className="p-4 rounded-lg flex flex-col items-center justify-center gap-2 text-center"
                    style={{ 
                      backgroundColor: color.color,
                      color: parseInt(color.name) > 400 ? 'white' : 'var(--color-text)'
                    }}
                  >
                    <span className="font-bold">{color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Iconografía */}
        <section>
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-primary-600)' }}>Iconografía</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {icons.map(({ Icon, name }) => (
              <div 
                key={name} 
                className="flex flex-col items-center gap-4 p-6 rounded-lg transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--color-primary-50)',
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary-100)' }}
                >
                  <Icon className="w-8 h-8" style={{ color: 'var(--color-primary-600)' }} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold" style={{ color: 'var(--color-primary-700)' }}>{name}</h3>
                  <code className="text-sm opacity-70">24x24</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tipografía */}
        <section>
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-primary-600)' }}>Tipografía</h2>
          
          {/* Familia tipográfica */}
          <div className="mb-12 p-8 rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--color-primary-700)' }}>Syne</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-70">Pesos</h4>
                <div className="space-y-4">
                  <p className="font-normal text-2xl">Regular 400</p>
                  <p className="font-bold text-2xl">Bold 700</p>
                  <p className="font-extrabold text-2xl">Extra Bold 800</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-70">Estilos</h4>
                <div className="space-y-4">
                  <p className="italic text-2xl">Italic</p>
                  <p className="font-[Syne_Mono] text-2xl">Mono</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jerarquía tipográfica */}
          <div>
            <h3 className="text-xl font-bold mb-6">Jerarquía Tipográfica</h3>
            <div className="space-y-8">
              <div className="flex items-baseline gap-8">
                <div className="w-20 text-sm opacity-70">Display</div>
                <p className="text-5xl font-extrabold">Aa Bb Cc 123</p>
              </div>
              <div className="flex items-baseline gap-8">
                <div className="w-20 text-sm opacity-70">H1</div>
                <p className="text-4xl font-bold">Aa Bb Cc 123</p>
              </div>
              <div className="flex items-baseline gap-8">
                <div className="w-20 text-sm opacity-70">H2</div>
                <p className="text-3xl font-bold">Aa Bb Cc 123</p>
              </div>
              <div className="flex items-baseline gap-8">
                <div className="w-20 text-sm opacity-70">H3</div>
                <p className="text-2xl font-bold">Aa Bb Cc 123</p>
              </div>
              <div className="flex items-baseline gap-8">
                <div className="w-20 text-sm opacity-70">Body</div>
                <p className="text-base">Aa Bb Cc 123</p>
              </div>
              <div className="flex items-baseline gap-8">
                <div className="w-20 text-sm opacity-70">Small</div>
                <p className="text-sm">Aa Bb Cc 123</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 mt-16" style={{ backgroundColor: 'var(--color-primary-50)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm opacity-70">
            UcaBytes Design System v1.0 • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

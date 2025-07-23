import { HomeIcon } from './icons/Home'
import { AutomationIcon } from './icons/Automation'
import { OperationsIcon } from './icons/Operations'
import { ServicesIcon } from './icons/Services'
import { MegaphoneIcon } from './icons/Megaphone'
import { ReturnIcon } from './icons/Return'
import { NotificationIcon } from './icons/Notification'
import './App.css'

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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Prueba de Iconos</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {icons.map(({ Icon, name }) => (
          <div key={name} className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:bg-gray-50">
            <Icon className="w-8 h-8" />
            <span className="text-sm font-medium">{name}</span>
          </div>
        ))}
      </div>

      {/* Ejemplos de tamaños y colores */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Ejemplos de Personalización</h2>
        <div className="flex gap-8 items-center">
          <HomeIcon className="w-6 h-6 text-blue-500" />
          <HomeIcon className="w-8 h-8 text-green-500" />
          <HomeIcon className="w-10 h-10 text-red-500" />
          <HomeIcon className="w-12 h-12 text-purple-500" />
        </div>
      </div>
    </div>
  )
}

export default App

# 🚀 UcaBytes - Plataforma Integral para PyMEs

**UcaBytes** es una plataforma web integral diseñada específicamente para Pequeñas y Medianas Empresas (PyMEs) que combina herramientas de gestión empresarial, marketing digital y automatización en una sola solución.

## 🎯 ¿Qué es UcaBytes?

UcaBytes es una aplicación web moderna que ofrece a las PyMEs todas las herramientas necesarias para digitalizar y optimizar sus operaciones comerciales, desde la gestión interna hasta la presencia digital.

## ✨ Características Principales

### 🏢 **Gestión Empresarial**
- **Dashboard Intuitivo**: Vista general de métricas clave del negocio
- **Gestión de Productos y Servicios**: Catálogo digital completo
- **Control de Operaciones Centrales**: Gestión de empleados, tareas y ventas
- **Sistema de Configuración**: Personalización completa de la plataforma

### 🎨 **Marketing Digital**
- **Generador de Sitios Web**: Crea sitios web profesionales en minutos
  - Plantillas predefinidas (Restaurante, Tienda, Profesional)
  - Editor visual drag & drop
  - Personalización completa de contenido y estilos
  - Publicación automática con Firebase Hosting
- **Asistente de Instagram**: Gestión integral de redes sociales
  - Programación de posts e historias
  - Análisis de métricas de engagement
  - Sugerencias de contenido con IA
  - Integración con Meta Business API

### 🤖 **Automatización e IA**
- **Chatbot Inteligente**: Asistente virtual para consultas empresariales
- **Análisis Predictivo**: Insights basados en datos de la empresa
- **Automatización de Tareas**: Flujos de trabajo optimizados

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 19** con TypeScript
- **Vite** para build y desarrollo
- **TailwindCSS** para estilos
- **Framer Motion** para animaciones
- **React Router** para navegación

### **Backend & Base de Datos**
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Firebase** (Hosting + Firestore)

### **Integraciones**
- **Meta Business API** (Instagram/Facebook)
- **OpenAI API** (Chatbot y sugerencias)

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/iadev2005/UcaBytes.git
cd UcaBytes/frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```
Editar `.env` con tus credenciales de Supabase y Firebase.

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Build para producción**
```bash
npm run build
```

## 📱 Funcionalidades Detalladas

### **Generador de Sitios Web**
- **Editor Visual**: Interfaz drag & drop intuitiva
- **Plantillas Responsivas**: Diseños optimizados para móviles
- **Personalización Avanzada**: Colores, fuentes, layouts
- **Publicación Instantánea**: Deploy automático a Firebase

### **Dashboard Empresarial**
- **Métricas en Tiempo Real**: Ventas, productos, servicios
- **Gráficos Interactivos**: Visualización de datos con Recharts
- **Filtros Dinámicos**: Análisis por períodos y categorías

### **Gestión de Redes Sociales**
- **Programación Inteligente**: Posts automáticos en horarios óptimos
- **Análisis de Performance**: Métricas detalladas de engagement
- **Contenido Generado por IA**: Sugerencias personalizadas

## 🔧 Configuración de APIs

### **Supabase**
- Configurar proyecto en [supabase.com](https://supabase.com)
- Obtener URL y anon key
- Configurar tablas de base de datos

### **Firebase**
- Crear proyecto en [firebase.google.com](https://firebase.google.com)
- Habilitar Hosting y Firestore
- Configurar reglas de seguridad

### **Meta Business API**
- Crear aplicación en [developers.facebook.com](https://developers.facebook.com)
- Configurar permisos de Instagram Business
- Obtener token de acceso

## 📦 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── pages/              # Páginas principales
│   ├── context/            # Contextos de React
│   ├── types/              # Definiciones de TypeScript
│   ├── lib/                # Utilidades y helpers
│   ├── firebase/           # Configuración de Firebase
│   └── supabase/           # Configuración de Supabase
├── public/                 # Assets estáticos
├── dist/                   # Build de producción
└── firebase.json           # Configuración de Firebase Hosting
```

## 🚀 Deployment

### **Firebase Hosting**
```bash
npm run build
firebase deploy
```

### **Variables de Entorno Requeridas**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [iadev2005](https://github.com/iadev2005)
- **Proyecto**: Hackathon Cudicoders

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: [tu-email@ejemplo.com]
- 🐛 Issues: [GitHub Issues](https://github.com/iadev2005/UcaBytes/issues)

---

**UcaBytes** - Transformando PyMEs con tecnología moderna 🚀

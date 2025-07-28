# 🚀 PymeUp - Plataforma Integral para PyMEs

**PymeUp** es una plataforma web integral diseñada específicamente para Pequeñas y Medianas Empresas (PyMEs) que combina herramientas de gestión empresarial, marketing digital y automatización en una sola solución.

## 🎯 ¿Qué es PymeUp?

PymeUp es una aplicación web moderna que ofrece a las PyMEs todas las herramientas necesarias para digitalizar y optimizar sus operaciones comerciales, desde la gestión interna hasta la presencia digital.

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

### **Backend**
- **Node.js** con Express
- **Firebase** (Hosting + Firestore)
- **Supabase** (PostgreSQL + Auth + Real-time)

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
git clone https://github.com/iadev2005/PymeUp.git
cd PymeUp
```

2. **Instalar dependencias del Backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del Frontend**
```bash
cd ../frontend
npm install
```

4. **Configurar variables de entorno**

**Backend (.env en carpeta backend):**
```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
```

**Frontend (.env en carpeta frontend):**
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

## 🚀 Iniciar el Proyecto

### **Terminal 1 - Backend**
```bash
cd backend
npm start
```
El backend se ejecutará en `http://localhost:3001`

### **Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```
El frontend se ejecutará en `http://localhost:5173`

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
PymeUp/
├── backend/                 # Servidor Node.js + Express
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependencias del backend
│   └── .env               # Variables de entorno del backend
├── frontend/               # Aplicación React + Vite
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── context/       # Contextos de React
│   │   ├── types/         # Definiciones de TypeScript
│   │   ├── lib/           # Utilidades y helpers
│   │   ├── firebase/      # Configuración de Firebase
│   │   └── supabase/      # Configuración de Supabase
│   ├── public/            # Assets estáticos
│   ├── dist/              # Build de producción
│   ├── package.json       # Dependencias del frontend
│   ├── firebase.json      # Configuración de Firebase Hosting
│   └── .env              # Variables de entorno del frontend
└── README.md              # Este archivo
```

## 🚀 Deployment

### **Backend (Heroku/Railway/Vercel)**
```bash
cd backend
npm start
```

### **Frontend (Firebase Hosting)**
```bash
cd frontend
npm run build
firebase deploy
```

## 🐛 Solución de Problemas

### **Error de puerto ocupado**
Si el puerto 3001 está ocupado, cambia el puerto en `backend/.env`:
```env
PORT=3002
```

### **Error de CORS**
El backend ya incluye configuración CORS para desarrollo local.

### **Error de variables de entorno**
Asegúrate de que ambos archivos `.env` estén configurados correctamente.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

**PymeUp** fue desarrollado durante el Hackathon de Cudicoders por un equipo multidisciplinario:

### **Desarrolladores**
- **[iadev2005](https://github.com/iadev2005)** - Desarrollador Principal
- **[Kobalt09](https://github.com/Kobalt09)** - Cristian Baczek
- **[notoriussss](https://github.com/notoriussss)** - Samuel Guzmán
- **[wildeswt](https://github.com/wildeswt)** - María Sandoval
- **[Carlos19men](https://github.com/Carlos19men)** - Carlos Méndez

### **Proyecto**
- **Evento**: Hackathon Cudicoders
- **Plataforma**: PymeUp - Transformando PyMEs con tecnología moderna

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: [tu-email@ejemplo.com]
- 🐛 Issues: [GitHub Issues](https://github.com/iadev2005/PymeUp/issues)

---

**PymeUp** - Transformando PyMEs con tecnología moderna 🚀

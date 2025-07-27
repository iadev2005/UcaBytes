import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para copiar texto al portapapeles
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Usar la API moderna del navegador
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Error al copiar al portapapeles:', error);
    return false;
  }
}

// Función para mostrar notificación de copiado
export function showCopyNotification(success: boolean, message: string = '') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `fixed top-10 right-10 z-50 text-2xl px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform ${
    success 
      ? 'bg-[var(--color-primary-600)] text-white' 
      : 'bg-red-500 text-white'
  }`;
  
  notification.textContent = success 
    ? (message || '¡Copiado al portapapeles!') 
    : (message || 'Error al copiar');
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
} 
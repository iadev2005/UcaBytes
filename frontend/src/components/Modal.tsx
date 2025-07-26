import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title, size = 'md' }) => {
  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-2xl shadow-xl p-4 sm:p-6 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto relative flex flex-col`}>
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {title && (
          <h2 className="text-lg sm:text-xl font-bold mb-4 pr-8 text-[var(--color-primary-700)]">
            {title}
          </h2>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
  
  return typeof window !== "undefined"
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default Modal; 
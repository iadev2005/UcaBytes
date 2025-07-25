import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null;
  const modalContent = (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 min-w-[300px] max-w-full relative flex flex-col items-center justify-center">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold cursor-pointer"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
  return typeof window !== "undefined"
    ? ReactDOM.createPortal(modalContent, document.body)
    : null;
};

export default Modal; 
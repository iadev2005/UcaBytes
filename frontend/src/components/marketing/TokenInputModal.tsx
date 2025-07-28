import React, { useState, useContext } from 'react';
import { SidebarCollapseContext } from '../../pages/Layout';

interface TokenInputModalProps {
  isOpen: boolean;
  onSubmit: (token: string) => void;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
  showCancelButton?: boolean;
  onShowGuide?: () => void;
}

export default function TokenInputModal({ 
  isOpen, 
  onSubmit, 
  onClose, 
  isLoading = false, 
  error = null,
  showCancelButton = true,
  onShowGuide
}: TokenInputModalProps) {
  const [token, setToken] = useState('');
  const { isSidebarCollapsed } = useContext(SidebarCollapseContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onSubmit(token.trim());
    }
  };

  const handleClose = () => {
    setToken('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-in-out"
         style={{ 
           marginLeft: isSidebarCollapsed ? '4rem' : '20rem',
           width: isSidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 20rem)'
         }}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Token de Instagram
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Ingresa tu token de acceso de Instagram para continuar
          </p>
          {onShowGuide && (
            <button
              type="button"
              onClick={onShowGuide}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ¿Cómo obtener el token?
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
              Token de Acceso
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa tu token de Instagram..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {showCancelButton && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !token.trim()}
              className={`px-4 py-2 text-white bg-[var(--color-secondary-500)] rounded-lg hover:bg-[var(--color-secondary-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary-500)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                showCancelButton ? 'flex-1' : 'w-full'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validando...
                </div>
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
import React from 'react';

interface LoadingScreenProps {
  message?: string;
  subtitle?: string;
}

export default function LoadingScreen({ 
  message = "Cargando publicaciones de Instagram...", 
  subtitle = "Esto puede tardar unos segundos" 
}: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <svg className="animate-spin h-16 w-16 text-[var(--color-primary-700)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
      <div className="text-2xl font-bold text-[var(--color-primary-700)] mb-2 text-center">{message}</div>
      <div className="text-base text-gray-500 text-center">{subtitle}</div>
    </div>
  );
} 
import React, { type SVGProps } from 'react';

export const HomeIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={24} 
      height={24} 
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z" />
    </svg>
  );
};
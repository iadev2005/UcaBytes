import React, { type SVGProps } from 'react';

export const OperationsIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={24} 
      height={24} 
      viewBox="0 0 16 16"
      {...props}
    >
      <path fill="currentColor" fillRule="evenodd" d="M14 2H2v10h5.5v1H5v1h6v-1H8.5v-1H14zM4.812 8.89l2.15-1.72L8.47 8.676l3.35-2.792l-.64-.768l-2.648 2.208L7.037 5.83l-2.85 2.28z" clipRule="evenodd" />
    </svg>
  );
};
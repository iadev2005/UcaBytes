import React, { type SVGProps } from 'react';

export const ReturnIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={24} 
      height={24} 
      viewBox="0 0 24 24"
      {...props}
    >
      <path fill="currentColor" d="m9 18l-6-6l6-6l1.4 1.4L6.8 11H19V7h2v6H6.8l3.6 3.6z" />
    </svg>
  );
};
import React, { type SVGProps } from 'react';

export const MinimizeIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14h4m0 0v4m0-4l-6 6m14-10h-4m0 0V6m0 4l6-6"></path>
  </svg>
); 
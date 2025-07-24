import React, { type SVGProps } from 'react';

export const MaximizeIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 20H4m0 0v-4m0 4l6-6m6-10h4m0 0v4m0-4l-6 6"></path>
  </svg>
); 
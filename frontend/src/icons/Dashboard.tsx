import React, { type SVGProps } from 'react';

export const DashboardIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <path fill="currentColor" d="M21.6667 15V5H35V15H21.6667ZM5 21.6667V5H18.3333V21.6667H5ZM21.6667 35V18.3333H35V35H21.6667ZM5 35V25H18.3333V35H5Z" />
    </svg>
  );
};

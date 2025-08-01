import React, {type SVGProps} from 'react';

export const LogOutIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
    return(
        <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
            {...props}
            fill="none"
        >
        <path d="M20 12H10.5M18 15L21 12L18 9M13 7V6C13 5.46957 12.7893 4.96086 12.4142 4.58579C12.0391 4.21071 11.5304 4 11 4H6C5.46957 4 4.96086 4.21071 4.58579 4.58579C4.21071 4.96086 4 5.46957 4 6V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H11C11.5304 20 12.0391 19.7893 12.4142 19.4142C12.7893 19.0391 13 18.5304 13 18V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    )
} 
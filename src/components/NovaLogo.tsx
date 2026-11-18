import React from 'react';

interface NovaLogoProps {
  className?: string;
  size?: number;
}

export default function NovaLogo({ className = '', size = 24 }: NovaLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="8"
          className="fill-indigo-600 dark:fill-indigo-500"
        />
        <path
          d="M16 6.5L18.8 13.2L25.5 16L18.8 18.8L16 25.5L13.2 18.8L6.5 16L13.2 13.2L16 6.5Z"
          fill="#FFFFFF"
        />
        <circle cx="16" cy="16" r="2.2" className="fill-indigo-600 dark:fill-indigo-500" />
      </svg>
      <span className="font-display font-bold tracking-tight whitespace-nowrap">
        Nova AI
      </span>
    </span>
  );
}

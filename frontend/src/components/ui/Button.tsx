import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'emergency';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const VARIANTS: Record<string, string> = {
  primary:   'bg-primary text-white hover:bg-primary-dark focus:ring-2 focus:ring-offset-2',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-300',
  outline:   'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-2 focus:ring-offset-2 bg-transparent',
  ghost:     'text-primary hover:bg-red-50 focus:ring-2 focus:ring-offset-1 bg-transparent',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-400',
  emergency: 'bg-emergency text-white hover:bg-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-red-400 shadow-md',
};

const SIZES: Record<string, string> = {
  sm: 'h-8  px-3  text-xs  gap-1.5',
  md: 'h-10 px-5  text-sm  gap-2',
  lg: 'h-12 px-7  text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold rounded-xl
        transition-all duration-150 select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
      {children}
    </button>
  );
}

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    default: 'bg-amber-500 text-black hover:bg-amber-600',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-600 text-white hover:bg-gray-800 hover:text-white',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    ghost: 'text-white hover:bg-gray-800 hover:text-white',
    link: 'text-amber-400 underline-offset-4 hover:underline'
  };
  
  const sizeStyles = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 py-1 text-xs',
    lg: 'h-12 px-6 py-3 text-base',
    icon: 'h-10 w-10'
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
}
import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variantStyles = {
    default: 'bg-amber-500 text-black hover:bg-amber-600',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-600 text-white'
  };
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className || ''}`}>
      {children}
    </div>
  );
}
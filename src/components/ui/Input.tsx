import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    'w-full px-3 py-2 bg-fantasy-blue border rounded-md text-white placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-fantasy-gold focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error ? 'border-red-500' : 'border-fantasy-purple',
    className
  ].join(' ');
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-fantasy font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
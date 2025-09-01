import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const selectClasses = [
    'w-full px-3 py-2 bg-fantasy-blue border rounded-md text-white',
    'focus:outline-none focus:ring-2 focus:ring-fantasy-gold focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed appearance-none',
    error ? 'border-red-500' : 'border-fantasy-purple',
    className
  ].join(' ');
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-fantasy font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={selectClasses}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="bg-fantasy-blue text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={20} 
        />
      </div>
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

export default Select;
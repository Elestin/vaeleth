import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg 
          text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
          resize-none transition-colors
          ${className || ''}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
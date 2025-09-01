import { createContext, useContext, useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = useState('');
  const [open, setOpen] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: ReactNode;
  className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  const { open, setOpen } = context;

  return (
    <button
      onClick={() => setOpen(!open)}
      className={`
        w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg 
        text-white flex items-center justify-between
        focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
        transition-colors
        ${className || ''}
      `}
    >
      {children}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  const { value } = context;
  
  return <span className="text-left">{value || placeholder}</span>;
}

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  const { open } = context;

  if (!open) return null;

  return (
    <div className={`
      absolute top-full left-0 right-0 z-50 mt-1
      bg-gray-800 border border-gray-600 rounded-lg shadow-lg
      max-h-60 overflow-y-auto
      ${className || ''}
    `}>
      {children}
    </div>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const { value: currentValue, onValueChange, setOpen } = context;

  const handleSelect = () => {
    onValueChange(value);
    setOpen(false);
  };

  return (
    <button
      onClick={handleSelect}
      className={`
        w-full px-3 py-2 text-left text-white hover:bg-gray-700
        transition-colors first:rounded-t-lg last:rounded-b-lg
        ${currentValue === value ? 'bg-amber-400/20 text-amber-400' : ''}
        ${className || ''}
      `}
    >
      {children}
    </button>
  );
}
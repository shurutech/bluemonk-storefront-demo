import { type ReactNode, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  optional?: boolean;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  children: ReactNode;
}

export const FormField = ({
  label,
  name,
  optional,
  error,
  maxLength,
  currentLength = 0,
  children,
}: FormFieldProps) => {
  const getCounterColor = () => {
    if (currentLength >= maxLength!) return 'text-red-500';
    if (currentLength >= maxLength! * 0.8) return 'text-amber-500';
    return 'text-slate-400';
  };

  const enhancedChild =
    isValidElement(children) && error
      ? cloneElement(children as React.ReactElement<{ className?: string }>, {
          className: cn(
            (children.props as { className?: string }).className,
            'border-red-500 focus-visible:ring-red-500'
          ),
        })
      : children;

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="font-normal text-slate-400"> (optional)</span>}
      </label>
      {enhancedChild}
      <div className="mt-1 flex items-center justify-between">
        {error ? <p className="text-xs text-red-500">{error}</p> : <span />}
        {maxLength !== undefined && (
          <span className={cn('text-xs', getCounterColor())}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

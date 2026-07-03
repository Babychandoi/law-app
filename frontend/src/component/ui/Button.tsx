// src/components/ui/Button.tsx
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  className,
  variant = 'default',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    default:
      'border border-brand-goldDark bg-brand-goldDark text-white hover:border-brand-ink hover:bg-brand-ink',
    outline: 'border border-brand-line bg-white text-brand-ink hover:border-brand-gold',
    ghost: 'text-brand-ink hover:bg-brand-surface',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

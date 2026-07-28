import React, { useId } from 'react';
import { FIELD_FOCUS } from './tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

/** Ô nhập dùng chung: label liên kết đúng id, trạng thái lỗi/hint, icon trái. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className = '', id, ...rest }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-invalid={!!error}
            className={`w-full rounded-control border px-3 py-2 text-sm transition-colors ${
              leftIcon ? 'pl-9' : ''
            } ${
              error
                ? 'border-red-500 outline-none focus:ring-2 focus:ring-red-500'
                : `border-gray-300 ${FIELD_FOCUS}`
            } ${className}`}
            {...rest}
          />
        </div>
        {error ? (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        ) : hint ? (
          <p className="text-gray-500 text-xs mt-1">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

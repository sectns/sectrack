import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon: Icon, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-tight">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {Icon && (
                        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-full h-12 px-4 ${Icon ? 'pl-12' : ''}
                            bg-slate-900 
                            border border-slate-800 
                            rounded-xl 
                            text-white text-sm font-medium
                            placeholder:text-slate-500
                            transition-all duration-200
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-emerald-500/50 
                            focus:border-emerald-500/50
                            focus:bg-slate-900/80
                            hover:border-slate-700
                            disabled:opacity-50 
                            disabled:cursor-not-allowed
                            ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-xs font-medium text-red-400 animate-shake">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-2 text-xs text-slate-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;

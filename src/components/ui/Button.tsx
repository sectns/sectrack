import { ButtonHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            icon: Icon,
            iconPosition = 'left',
            loading = false,
            fullWidth = false,
            children,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = `
            inline-flex items-center justify-center gap-2
            font-semibold tracking-tight
            rounded-xl
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            ${fullWidth ? 'w-full' : ''}
        `;

        const variants = {
            primary: `
                bg-gradient-to-r from-emerald-600 to-emerald-500
                text-white
                shadow-lg shadow-emerald-900/30
                hover:shadow-xl hover:shadow-emerald-900/40
                hover:from-emerald-500 hover:to-emerald-400
                active:scale-[0.98]
                focus:ring-emerald-500/50
            `,
            secondary: `
                bg-slate-800/50
                text-slate-200
                border border-slate-700/50
                hover:bg-slate-800
                hover:border-slate-600
                active:scale-[0.98]
                focus:ring-slate-500/50
            `,
            ghost: `
                text-slate-300
                hover:bg-slate-800/50
                active:scale-[0.98]
                focus:ring-slate-500/50
            `,
            danger: `
                bg-red-600
                text-white
                shadow-lg shadow-red-900/30
                hover:bg-red-500
                hover:shadow-xl hover:shadow-red-900/40
                active:scale-[0.98]
                focus:ring-red-500/50
            `,
        };

        const sizes = {
            sm: 'h-9 px-4 text-sm',
            md: 'h-11 px-6 text-sm',
            lg: 'h-12 px-8 text-base',
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
                {children}
                {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;

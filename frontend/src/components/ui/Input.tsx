
import React from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    variant?: 'default' | 'glass';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, variant = 'default', ...props }, ref) => {

        const variants = {
            default: "bg-secondary/50 border-white/10 focus:border-primary/50 placeholder:text-slate-500",
            glass: "bg-white/5 border-white/10 focus:bg-white/10 focus:border-white/20 placeholder:text-white/30 backdrop-blur-sm",
        };

        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-xl border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 text-white",
                    variants[variant],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

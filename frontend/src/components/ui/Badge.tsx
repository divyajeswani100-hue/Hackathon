
import React from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'glass';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'neutral', ...props }, ref) => {

        const variants: Record<BadgeVariant, string> = {
            neutral: "bg-slate-800 text-slate-300 border border-slate-700",
            success: "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(74,222,128,0.1)]",
            warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
            danger: "bg-red-500/10 text-red-400 border border-red-500/20",
            info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
            glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white",
        };

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

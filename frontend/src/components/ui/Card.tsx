
import React from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'neon';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {

        const variants = {
            default: "bg-secondary border border-white/10 text-secondary-foreground shadow-xl",
            glass: "glass-panel",
            neon: "bg-black/40 border border-accent/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl p-6",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = "Card";

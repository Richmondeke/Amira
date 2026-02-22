import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={clsx(
                "bg-white dark:bg-[var(--color-surface-dark)] border border-slate-200 dark:border-[var(--color-border-dark)] rounded-xl p-6 transition-all",
                onClick && "cursor-pointer hover:border-[var(--color-primary)]/50 hover:shadow-lg dark:hover:shadow-blue-500/5",
                className
            )}
        >
            {children}
        </div>
    );
}

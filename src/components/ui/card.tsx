import React, { forwardRef } from 'react';

interface CardProps {
    className?: string;
    children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', children }, ref) => {
    return (
        <div ref={ref} className={`bg-white shadow rounded-lg ${className}`}>
            {children}
        </div>
    );
});

Card.displayName = 'Card';

interface CardContentProps {
    children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children }) => {
    return <div className="p-4">{children}</div>;
};

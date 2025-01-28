import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ className = '', children, ...props }) => {
    return (
        <button className={`bg-blue-500 text-white p-2 rounded ${className}`} {...props}>
            {children}
        </button>
    );
};

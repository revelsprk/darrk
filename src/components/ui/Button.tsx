import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | "text";
  className?: string;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  icon,
  variant = 'primary',
  className = '',
  iconPosition = 'left',
  children,
  size = 'md',
}) => {
  const baseStyles = 'flex items-center rounded-md whitespace-nowrap duration-200 px-4 py-1.5 font-bold select-none';

  const variantStyles = {
    primary: 'bg-blue-600 text-white',
    secondary: 'bg-blue-50 text-blue-600',
    danger: 'bg-red-50 text-red-600',
    outline: 'bg-white text-zinc-800 border border-zinc-200',
    text: "bg-transparent text-zinc-800"
  };

  const sizeStyles = {
    sm: 'text-sm h-8 px-3.5 py-1.5',
    md: 'text-base h-10 px-4 py-2',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
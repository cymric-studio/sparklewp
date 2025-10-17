import React from 'react';

const Button = ({
  children,
  variant = 'filled',
  color = 'blue',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    filled: {
      blue: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
      brand: 'bg-brand-500 text-white hover:bg-brand-600 shadow-md hover:shadow-lg',
      green: 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg',
      red: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
      orange: 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg',
      gray: 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg',
    },
    gradient: {
      blue: 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 shadow-card hover:shadow-hover hover:-translate-y-0.5',
      brand: 'bg-gradient-primary text-white hover:opacity-90 shadow-card hover:shadow-hover hover:-translate-y-0.5',
    },
    outline: {
      blue: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      brand: 'border-2 border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20',
      green: 'border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
      red: 'border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
      gray: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/20',
    },
    subtle: {
      blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30',
      brand: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/30',
      green: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30',
      red: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30',
      gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/20 dark:text-gray-300 dark:hover:bg-gray-700/30',
    },
    light: {
      blue: 'bg-transparent text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      brand: 'bg-transparent text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20',
      green: 'bg-transparent text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
      red: 'bg-transparent text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
      gray: 'bg-transparent text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/20',
    },
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const colorClass = variantClasses[variant]?.[color] || variantClasses[variant]?.blue || '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${colorClass} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;

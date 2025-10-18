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
      blue: 'bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg',
      brand: 'bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg',
      green: 'bg-gray-800 text-white hover:bg-gray-900 shadow-md hover:shadow-lg',
      red: 'bg-gray-700 text-white hover:bg-gray-800 shadow-md hover:shadow-lg',
      orange: 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg',
      gray: 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg',
    },
    gradient: {
      blue: 'bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black shadow-card hover:shadow-hover hover:-translate-y-0.5',
      brand: 'bg-gradient-primary text-white hover:opacity-90 shadow-card hover:shadow-hover hover:-translate-y-0.5',
    },
    outline: {
      blue: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-white/10',
      brand: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-50 dark:border-white dark:text-white dark:hover:bg-white/10',
      green: 'border-2 border-gray-800 text-gray-800 hover:bg-gray-50 dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-300/10',
      red: 'border-2 border-gray-700 text-gray-700 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-400/10',
      gray: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/20',
    },
    subtle: {
      blue: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      brand: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
      green: 'bg-gray-50 text-gray-800 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:bg-gray-800',
      red: 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/50 dark:text-gray-300 dark:hover:bg-gray-700',
      gray: 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700/20 dark:text-gray-300 dark:hover:bg-gray-700/30',
    },
    light: {
      blue: 'bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10',
      brand: 'bg-transparent text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10',
      green: 'bg-transparent text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-200/10',
      red: 'bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-300/10',
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

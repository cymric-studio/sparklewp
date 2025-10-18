import React from 'react';

const Badge = ({
  children,
  color = 'blue',
  variant = 'filled',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
    xl: 'px-5 py-2 text-base',
  };

  const variantClasses = {
    filled: {
      blue: 'bg-gray-900 text-white',
      brand: 'bg-black text-white',
      green: 'bg-gray-800 text-white',
      red: 'bg-gray-700 text-white',
      orange: 'bg-gray-600 text-white',
      yellow: 'bg-gray-500 text-white',
      gray: 'bg-gray-600 text-white',
      violet: 'bg-gray-700 text-white',
    },
    light: {
      blue: 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
      brand: 'bg-gray-50 text-gray-900 dark:bg-gray-800/50 dark:text-gray-100',
      green: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      red: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      orange: 'bg-gray-50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
      yellow: 'bg-gray-50 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
      gray: 'bg-gray-50 text-gray-700 dark:bg-gray-700/20 dark:text-gray-300',
      violet: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    },
    outline: {
      blue: 'border border-gray-900 text-gray-900 dark:border-white dark:text-white',
      brand: 'border border-black text-black dark:border-white dark:text-white',
      green: 'border border-gray-800 text-gray-800 dark:border-gray-200 dark:text-gray-200',
      red: 'border border-gray-700 text-gray-700 dark:border-gray-300 dark:text-gray-300',
      orange: 'border border-gray-600 text-gray-600 dark:border-gray-400 dark:text-gray-400',
      yellow: 'border border-gray-500 text-gray-500 dark:border-gray-400 dark:text-gray-400',
      gray: 'border border-gray-600 text-gray-600 dark:text-gray-400',
      violet: 'border border-gray-700 text-gray-700 dark:border-gray-300 dark:text-gray-300',
    },
  };

  const colorClass = variantClasses[variant]?.[color] || variantClasses[variant]?.blue || '';

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

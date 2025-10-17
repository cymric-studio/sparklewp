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
      blue: 'bg-blue-600 text-white',
      brand: 'bg-brand-500 text-white',
      green: 'bg-green-600 text-white',
      red: 'bg-red-600 text-white',
      orange: 'bg-orange-600 text-white',
      yellow: 'bg-yellow-500 text-white',
      gray: 'bg-gray-600 text-white',
    },
    light: {
      blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
      brand: 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300',
      green: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
      red: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
      orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
      yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
      gray: 'bg-gray-50 text-gray-700 dark:bg-gray-700/20 dark:text-gray-300',
    },
    outline: {
      blue: 'border border-blue-600 text-blue-600 dark:text-blue-400',
      brand: 'border border-brand-500 text-brand-500 dark:text-brand-400',
      green: 'border border-green-600 text-green-600 dark:text-green-400',
      red: 'border border-red-600 text-red-600 dark:text-red-400',
      orange: 'border border-orange-600 text-orange-600 dark:text-orange-400',
      yellow: 'border border-yellow-500 text-yellow-600 dark:text-yellow-400',
      gray: 'border border-gray-600 text-gray-600 dark:text-gray-400',
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

import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  withBorder = false,
  glass = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';

  const paddingClasses = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    card: 'shadow-card hover:shadow-hover',
  };

  const borderClass = withBorder ? 'border border-gray-200 dark:border-gray-700' : '';

  const glassClasses = glass
    ? 'backdrop-blur-glass bg-white/15 dark:bg-gray-800/15 border border-white/20 dark:border-gray-700/20 shadow-glass'
    : 'bg-white dark:bg-gray-800';

  const clickableClass = onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClass} ${glassClasses} ${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

const Input = ({
  label,
  error,
  description,
  required = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  const stateClasses = error
    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50'
    : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900/50';

  const iconPaddingClasses = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : '';

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {leftIcon}
          </div>
        )}
        <input
          className={`${baseClasses} ${stateClasses} ${iconPaddingClasses} focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  description,
  required = false,
  className = '',
  rows = 4,
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  const stateClasses = error
    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50'
    : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-900/50';

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <textarea
        rows={rows}
        className={`${baseClasses} ${stateClasses} focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-y`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1.5">{error}</p>
      )}
    </div>
  );
};

export const PasswordInput = ({ ...props }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      }
    />
  );
};

export default Input;

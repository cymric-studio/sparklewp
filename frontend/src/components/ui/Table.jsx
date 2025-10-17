import React from 'react';

export const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full border-collapse ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-700/50 ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className = '', onClick, ...props }) => {
  const clickableClass = onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors' : '';

  return (
    <tr
      className={`${clickableClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableData = ({ children, className = '', ...props }) => {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
};

export default Table;

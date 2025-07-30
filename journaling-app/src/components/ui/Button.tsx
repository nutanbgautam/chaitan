'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg'
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95',
    sizeClasses[size],
    variantClasses[variant],
    rounded ? 'rounded-full' : 'rounded-lg',
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  const iconClasses = iconSizeClasses[size];

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className={`${iconClasses} animate-spin ${iconPosition === 'right' ? 'order-2' : ''}`} />
          <span>{loadingText || children}</span>
        </>
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && <span className={iconClasses}>{icon}</span>}
          <span>{children}</span>
          {iconPosition === 'right' && <span className={iconClasses}>{icon}</span>}
        </>
      );
    }

    return children;
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={baseClasses}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {renderContent()}
    </motion.button>
  );
}

// Specialized button components
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="success" {...props} />
);

export const WarningButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="warning" {...props} />
);

export const ErrorButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="error" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="outline" {...props} />
);

// Icon button component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export function IconButton({ icon, size = 'md', ...props }: IconButtonProps) {
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      size={size}
      variant="ghost"
      className={`${sizeClasses[size]} !p-0`}
      {...props}
    >
      <span className={iconSizeClasses[size]}>{icon}</span>
    </Button>
  );
} 
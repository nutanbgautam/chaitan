'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Heart, Brain, Target, TrendingUp } from 'lucide-react';

interface LoadingProps {
  variant?: 'default' | 'wellness' | 'analysis' | 'processing' | 'skeleton';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showIcon?: boolean;
  className?: string;
}

const wellnessIcons = [Heart, Brain, Target, TrendingUp];

export default function Loading({ 
  variant = 'default', 
  size = 'md', 
  text,
  showIcon = true,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const renderLoadingContent = () => {
    switch (variant) {
      case 'wellness':
        return (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              {showIcon && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className={`${sizeClasses[size]} text-green-500`} />
                </motion.div>
              )}
            </motion.div>
            {text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${textSizes[size]} text-gray-600`}
              >
                {text}
              </motion.p>
            )}
          </div>
        );

      case 'analysis':
        return (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              {showIcon && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className={`${sizeClasses[size]} text-blue-500`} />
                </motion.div>
              )}
            </motion.div>
            {text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${textSizes[size]} text-gray-600`}
              >
                {text}
              </motion.p>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="text-center">
            <div className="relative mx-auto mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-green-500 rounded-full`}
              />
              {showIcon && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Loader2 className={`${sizeClasses[size]} text-green-500`} />
                </motion.div>
              )}
            </div>
            {text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${textSizes[size]} text-gray-600`}
              >
                {text}
              </motion.p>
            )}
          </div>
        );

      case 'skeleton':
        return (
          <div className="animate-pulse">
            <div className="flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              {showIcon && (
                <Loader2 className={`${sizeClasses[size]} text-green-500`} />
              )}
            </motion.div>
            {text && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`${textSizes[size]} text-gray-600`}
              >
                {text}
              </motion.p>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLoadingContent()}
    </div>
  );
}

// Specialized loading components
export const WellnessLoading = ({ text = "Taking care of your wellness...", ...props }: Omit<LoadingProps, 'variant'>) => (
  <Loading variant="wellness" text={text} {...props} />
);

export const AnalysisLoading = ({ text = "Analyzing your thoughts...", ...props }: Omit<LoadingProps, 'variant'>) => (
  <Loading variant="analysis" text={text} {...props} />
);

export const ProcessingLoading = ({ text = "Processing your entry...", ...props }: Omit<LoadingProps, 'variant'>) => (
  <Loading variant="processing" text={text} {...props} />
);

export const SkeletonLoading = (props: Omit<LoadingProps, 'variant'>) => (
  <Loading variant="skeleton" {...props} />
);

// Full screen loading component
export const FullScreenLoading = ({ text = "Loading your journal...", variant = 'default' }: LoadingProps) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
    <Loading variant={variant} size="lg" text={text} />
  </div>
); 
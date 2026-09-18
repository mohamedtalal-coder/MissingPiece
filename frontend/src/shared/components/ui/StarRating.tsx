import React from 'react';
import { Icon } from './Icon';

interface StarRatingProps {
  rating: number; // 0-5
  maxRating?: number;
  count?: number; // Total number of reviews
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  count,
  interactive = false,
  onChange,
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-[16px]',
    md: 'w-5 h-5 text-[20px]',
    lg: 'w-6 h-6 text-[24px]'
  };

  const handleStarClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="flex items-center" 
        role={interactive ? "radiogroup" : "img"} 
        aria-label={`Rating: ${rating} out of ${maxRating} stars`}
      >
        {Array.from({ length: maxRating }).map((_, index) => {
          // Calculate fill percentage for partial stars (0 to 1)
          const fill = Math.max(0, Math.min(1, rating - index));
          const isFull = fill >= 0.75;
          const isHalf = fill >= 0.25 && fill < 0.75;
          
          return (
            <button
              key={index}
              type={interactive ? "button" : undefined}
              onClick={() => handleStarClick(index)}
              disabled={!interactive}
              className={`
                relative ${sizeClasses[size]} 
                ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded-sm
              `}
              aria-checked={interactive ? rating >= index + 1 : undefined}
              role={interactive ? "radio" : undefined}
              aria-label={interactive ? `Rate ${index + 1} stars` : undefined}
            >
              <Icon 
                name="star" 
                className={`absolute inset-0 text-outline-variant/30 ${interactive ? 'hover:text-primary/50' : ''}`}
                fill="currentColor"
              />
              <div 
                className="absolute inset-0 overflow-hidden text-primary"
                style={{ width: isFull ? '100%' : isHalf ? '50%' : '0%' }}
              >
                <Icon name="star" className="w-full h-full" fill="currentColor" />
              </div>
            </button>
          );
        })}
      </div>
      
      {count !== undefined && (
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          ({count})
        </span>
      )}
    </div>
  );
};

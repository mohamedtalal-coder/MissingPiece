import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-md bg-surface border border-border shadow-md animate-pulse ">
      {/* Image placeholder */}
      <div className="aspect-[4/5] bg-surface w-full"></div>
      
      {/* Content placeholder */}
      <div className="p-5 flex flex-col gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-surface rounded w-3/4"></div>
          <div className="h-4 bg-surface rounded w-1/2"></div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="h-6 bg-surface rounded w-1/4"></div>
          <div className="h-9 bg-surface rounded-md w-24"></div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      className="w-full flex flex-col bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/20"
      aria-hidden
    >
      <div className="aspect-[4/5] w-full animate-shimmer" />
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <div className="h-3 rounded w-1/3 animate-shimmer" />
          <div className="h-5 rounded w-3/4 animate-shimmer" />
          <div className="h-3 rounded w-1/2 animate-shimmer" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 rounded w-1/4 animate-shimmer" />
          <div className="h-8 rounded-md w-24 animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

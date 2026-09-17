import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-purple-950/20 border border-purple-500/5 shadow-md animate-pulse backdrop-blur-sm">
      {/* Image placeholder */}
      <div className="aspect-[4/5] bg-purple-900/30 w-full"></div>
      
      {/* Content placeholder */}
      <div className="p-5 flex flex-col gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-purple-800/40 rounded w-3/4"></div>
          <div className="h-4 bg-purple-800/30 rounded w-1/2"></div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="h-6 bg-purple-800/40 rounded w-1/4"></div>
          <div className="h-9 bg-purple-800/50 rounded-xl w-24"></div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`bg-surface-container-lowest rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group overflow-hidden ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardImage: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`relative w-full h-64 sm:h-72 bg-surface-container overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', ...props }) => {
  return (
    <img className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${className}`} {...props} />
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-space-lg flex flex-col flex-1 justify-between ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`mt-space-lg pt-space-md border-t-0 flex items-center justify-between gap-space-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

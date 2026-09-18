import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`group flex flex-col bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 hover:border-outline-variant/40 transition-all ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardImage: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/5] overflow-hidden bg-surface-container-high ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', ...props }) => {
  return (
    <img className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${className}`} {...props} />
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-space-lg flex flex-col flex-1 justify-between gap-space-md ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...props }) => {
  return (
    <div className={`pt-space-sm flex items-center justify-between border-t border-outline-variant/20 ${className}`} {...props}>
      {children}
    </div>
  );
};

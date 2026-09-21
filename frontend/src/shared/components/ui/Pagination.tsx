import React from 'react';
import { Icon } from './Icon';
import { useLanguage } from '../../context/LanguageContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const { t } = useLanguage() as any;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Simplified logic for showing pages - always show first, last, and pages around current
  const visiblePages = pages.filter(page => {
    if (page === 1 || page === totalPages) return true;
    if (page >= currentPage - 1 && page <= currentPage + 1) return true;
    return false;
  });

  return (
    <nav className={`flex items-center justify-center gap-1 mt-space-xl ${className}`} aria-label={t?.common?.pagination || "Pagination"}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label={t?.common?.previousPage || "Previous page"}
      >
        <Icon name="chevron_left" size={20} />
      </button>

      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          // Add ellipsis if gap between current page and previous visible page is > 1
          const showEllipsis = index > 0 && page - visiblePages[index - 1] > 1;

          return (
            <React.Fragment key={page}>
              {showEllipsis && (
                <span className="w-10 flex items-center justify-center text-on-surface-variant">...</span>
              )}
              <button
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`w-10 h-10 flex items-center justify-center rounded font-label-md text-label-md transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label={t?.common?.nextPage || "Next page"}
      >
        <Icon name="chevron_right" size={20} />
      </button>
    </nav>
  );
};

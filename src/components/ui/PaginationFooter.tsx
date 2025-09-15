import React, { useMemo } from 'react';

type PaginationFooterProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  label?: string; // e.g., 'Items', 'Assets'
  onPageChange: (page: number) => void;
  className?: string;
};

export default function PaginationFooter({
  page,
  totalPages,
  totalCount,
  label = 'Items',
  onPageChange,
  className = '',
}: PaginationFooterProps) {
  const safeTotalPages = Math.max(1, totalPages || 0);
  const trio = useMemo(() => {
    if (safeTotalPages <= 3) {
      return {
        slots: Array.from({ length: safeTotalPages }, (_, i) => i + 1),
        activeIndex: page - 1,
        fixed: false,
      } as const;
    }
    if (page === 1) return { slots: [1, 2, 3] as const, activeIndex: 0, fixed: true } as const;
    if (page === safeTotalPages)
      return {
        slots: [safeTotalPages - 2, safeTotalPages - 1, safeTotalPages] as const,
        activeIndex: 2,
        fixed: true,
      } as const;
    return { slots: [page - 1, page, page + 1] as const, activeIndex: 1, fixed: true } as const;
  }, [page, safeTotalPages]);

  const changePage = (p: number) => {
    const next = Math.min(Math.max(1, p), Math.max(1, safeTotalPages));
    if (next !== page) onPageChange(next);
  };

  return (
    <div className={`mt-4 flex items-center justify-between text-xs text-slate-400 ${className}`}>
      <span>
        Total : {totalCount} {label}
      </span>

      <div className="flex items-center gap-1 text-xs">
        {/* Prev */}
        <button
          disabled={page === 1 || safeTotalPages === 0}
          onClick={() => changePage(page - 1)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            page === 1 || totalPages === 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white'
          }`}
          style={{ backgroundColor: '#16171D' }}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Numbered trio */}
        {(trio.fixed ? (['left', 'center', 'right'] as const) : trio.slots).map((keyOrPage, i) => {
          const p = trio.fixed ? trio.slots[i] : (keyOrPage as number);
          const active = trio.fixed ? i === trio.activeIndex : p === page;
          const stableKey = trio.fixed ? ['left', 'center', 'right'][i] : String(p);
          const isSingle = safeTotalPages <= 1;

          return (
            <button
              key={stableKey}
              onClick={() => !isSingle && changePage(p)}
              disabled={isSingle}
              aria-disabled={isSingle}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                active ? 'text-white border' : 'text-slate-400 hover:text-white'
              }`}
              style={{
                backgroundColor: '#16171D',
                borderColor: active ? '#225FED' : 'transparent',
              }}
              aria-current={active ? 'page' : undefined}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          disabled={page === safeTotalPages || safeTotalPages === 0}
          onClick={() => changePage(page + 1)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            page === safeTotalPages || safeTotalPages === 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white'
          }`}
          style={{ backgroundColor: '#16171D' }}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

'use client';

import { useMemo, useState, ReactNode } from 'react';

type Props = {
  title?: string;
  children?: ReactNode;
  showPagination?: boolean;
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  totalAssets?: number;
  className?: string;
};

export default function HoldingAssetsTable({
  title = 'My holding assets',
  children,
  showPagination = true,
  totalPages = 10,
  initialPage = 1,
  onPageChange,
  totalAssets = 0,
  className = '',
}: Props) {
  const [page, setPage] = useState(initialPage);

  const changePage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    onPageChange?.(next);
  };

  const trio = useMemo(() => {
    if (totalPages <= 3) {
      return {
        slots: Array.from({ length: totalPages }, (_, i) => i + 1),
        activeIndex: page - 1,
        fixed: false,
      };
    }
    if (page === 1) return { slots: [1, 2, 3], activeIndex: 0, fixed: true };
    if (page === totalPages)
      return { slots: [totalPages - 2, totalPages - 1, totalPages], activeIndex: 2, fixed: true };
    return { slots: [page - 1, page, page + 1], activeIndex: 1, fixed: true };
  }, [page, totalPages]);

  return (
    <section
      className={`w-[1304px] h-[792px] m-[20px] bg-[#16171D] rounded-2xl px-5 py-3 flex flex-col ${className}`}
      role="region"
      aria-label="Holdings table container"
    >
      {/* Title */}
      <div className="mb-5 lg:mb-6 flex items-center justify-between">
        <h3 className="text-white/90 text-xl font pl-1">{title}</h3>
      </div>

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="h-full overflow-auto pr-4"
          style={{ scrollbarGutter: 'stable', overscrollBehavior: 'contain' }}
        >
          <div className="px-0">
            {totalAssets === 0 ? (
              <div className="mt-6 flex justify-center">
                <p className="text-slate-300 text-sm">No holding asset.</p>
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>Total : {totalAssets} Assets</span>

        {showPagination && totalAssets > 0 && (
          <div className="flex items-center gap-1 text-xs">
            {/* Prev */}
            <button
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                page === 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#16171D' }}
              aria-label="Previous page"
            >
              ‹
            </button>

            {/* Numbered pages (3 ช่องคงที่) */}
            {(trio.fixed ? (['left', 'center', 'right'] as const) : trio.slots).map(
              (keyOrPage, i) => {
                const p = trio.fixed ? trio.slots[i] : (keyOrPage as number);
                const active = trio.fixed ? i === trio.activeIndex : p === page;
                const stableKey = trio.fixed ? ['left', 'center', 'right'][i] : String(p);
                const isSingle = totalPages === 1;
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
              }
            )}

            {/* Next */}
            <button
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                page === totalPages
                  ? 'text-slate-500 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#16171D' }}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

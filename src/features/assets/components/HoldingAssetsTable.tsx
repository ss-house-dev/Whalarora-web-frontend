'use client';

import { useMemo, useState, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useHoldingDesktopBreakpoint } from '../hooks/useHoldingDesktopBreakpoint';

type Props = {
  title?: string;
  children?: ReactNode;
  showPagination?: boolean;
  totalPages?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  totalAssets?: number;
  className?: string;
  showDesktopHeader?: boolean;
  desktopHeader?: ReactNode;
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
  showDesktopHeader = false,
  desktopHeader,
}: Props) {
  const [page, setPage] = useState(initialPage);
  const isDesktopLayout = useHoldingDesktopBreakpoint();

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
      return {
        slots: [totalPages - 2, totalPages - 1, totalPages],
        activeIndex: 2,
        fixed: true,
      };
    return { slots: [page - 1, page, page + 1], activeIndex: 1, fixed: true };
  }, [page, totalPages]);

  const sectionClasses = clsx(
    'w-full max-w-[1304px] rounded-2xl bg-[#16171D] px-3 py-3 sm:px-5 sm:py-4 flex flex-col',
    isDesktopLayout && 'h-[460px] w-[1304px] px-5 py-3',
    className
  );

  const headerClasses = clsx(
    'mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
    isDesktopLayout && 'mb-3'
  );

  const contentWrapperClasses = clsx('relative flex-1', isDesktopLayout && 'overflow-hidden');
  const scrollRegionClasses = clsx(isDesktopLayout && 'h-full overflow-auto pr-4');
  const shouldRenderDesktopHeader = Boolean(isDesktopLayout && showDesktopHeader && desktopHeader);

  const footerClasses = clsx(
    'mt-4 flex flex-col gap-3 text-xs text-[#A4A4A4] sm:flex-row sm:items-center sm:justify-between',
    isDesktopLayout && 'mt-6'
  );

  return (
    <section className={sectionClasses} role="region" aria-label="Holdings table container">
      <div className={headerClasses}>
        <h3 className="text-xl font-normal text-white/90 font-['Alexandria']">{title}</h3>
      </div>

      <div className={contentWrapperClasses}>
        <div
          className={scrollRegionClasses}
          style={{ scrollbarGutter: 'stable', overscrollBehavior: 'contain' }}
        >
          {shouldRenderDesktopHeader && (
            <div className="sticky top-0 z-10 bg-[#16171D]">
              <div className="h-3 bg-[#16171D]" aria-hidden />
              {desktopHeader}
            </div>
          )}
          <div className="pt-1">
            {children ??
              (totalAssets === 0 ? (
                <div className="mt-6 flex justify-center">
                  <p className="text-sm text-slate-300">No holding asset.</p>
                </div>
              ) : null)}
          </div>
        </div>
      </div>

      <div className={footerClasses}>
        <span>Total : {totalAssets} Assets</span>

        {showPagination && (
          <div className="flex items-center gap-1 text-xs">
            <button
              disabled={page === 1}
              onClick={() => changePage(page - 1)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-0 ${
                page === 1 ? 'cursor-not-allowed text-slate-500' : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#1F2029', borderColor: '#3A3B44' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

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
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus:outline-none focus:ring-0 ${
                      active ? 'border text-white' : 'text-slate-400 hover:text-white'
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

            <button
              disabled={page === totalPages}
              onClick={() => changePage(page + 1)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-0 ${
                page === totalPages
                  ? 'cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:text-white'
              }`}
              style={{ backgroundColor: '#1F2029', borderColor: '#3A3B44' }}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

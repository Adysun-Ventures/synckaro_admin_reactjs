'use client';

import { type ChangeEvent } from 'react';
import { Pagination } from './Pagination';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE_OPTIONS = [50, 100, 200, 300];
const DEFAULT_EMPTY_MESSAGE = 'No entries to display';

interface PaginationFooterProps {
  // Pagination state
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;

  // Event handlers
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // Optional customization
  showPageSummary?: boolean;
  emptyMessage?: string;
  pageSizeOptions?: number[];
  className?: string;
}

export function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSummary = false,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: PaginationFooterProps) {
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  const entriesSummary =
    totalItems === 0
      ? emptyMessage
      : `Showing ${pageStart} to ${pageEnd} of ${totalItems} entries`;

  const pageSummary = totalItems === 0 ? '' : `Showing page ${currentPage} of ${totalPages}`;

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSize = Number(event.target.value);
    onPageSizeChange(nextSize);
  };

  if (totalItems === 0) {
    return (
      <div className={cn('border-t border-neutral-200 bg-neutral-50 px-4 py-3', className)}>
        <span className="text-xs text-neutral-500">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50 px-4 py-3 md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <label className="flex items-center gap-1">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs font-medium text-neutral-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>entries</span>
        </label>
        <span>{entriesSummary}</span>
        {showPageSummary && <span>{pageSummary}</span>}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        className="w-full md:w-auto"
      />
    </div>
  );
}


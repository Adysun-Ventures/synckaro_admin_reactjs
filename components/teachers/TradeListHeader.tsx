import { cn } from '@/lib/utils';

const columns = [
  { label: 'Stock', align: 'left' },
  { label: 'Type', align: 'center' },
  { label: 'Qty', align: 'right' },
  { label: 'Price', align: 'right' },
  { label: 'Exchange', align: 'center' },
  { label: 'Status', align: 'center' },
  { label: 'Date', align: 'right' },
];

export function TradeListHeader() {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[1.2fr_0.8fr_repeat(2,1fr)_1fr_1fr_1fr] items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
      {columns.map(({ label, align }) => (
        <span
          key={label}
          className={cn(
            'text-xs font-semibold uppercase tracking-wide text-neutral-500',
            align === 'right' && 'justify-self-end text-right',
            align === 'center' && 'text-center'
          )}
        >
          {label}
        </span>
      ))}
    </div>
  );
}




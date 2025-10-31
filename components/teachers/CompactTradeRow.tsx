import { Trade } from '@/types';
import { cn } from '@/lib/utils';

interface CompactTradeRowProps {
  trade: Trade;
}

export function CompactTradeRow({ trade }: CompactTradeRowProps) {
  const isBuy = trade.type === 'BUY';
  
  // Get status color with fallback for unknown statuses
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning-100 text-warning-800 border border-warning-200',
      executed: 'bg-success-100 text-success-800 border border-success-200',
      completed: 'bg-success-100 text-success-800 border border-success-200',
      failed: 'bg-danger-100 text-danger-800 border border-danger-200',
      cancelled: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
    };
    
    // Fallback for unknown statuses (neutral gray)
    return colors[status] || 'bg-neutral-100 text-neutral-800 border border-neutral-300';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        'grid grid-cols-[1.2fr_0.8fr_repeat(2,1fr)_1fr_1fr_1fr] items-center gap-3 px-4 py-3 border-l-[3px] transition-colors hover:bg-neutral-50/50',
        isBuy ? 'border-success-500 bg-success-50/20' : 'border-danger-500 bg-danger-50/20'
      )}
    >
      <span className="text-sm font-semibold text-neutral-900">{trade.stock}</span>
      <span
        className={cn(
          'justify-self-center rounded border px-2 py-0.5 text-[11px] font-bold',
          isBuy
            ? 'bg-success-100 text-success-800 border-success-200'
            : 'bg-danger-100 text-danger-800 border-danger-200'
        )}
      >
        {trade.type || 'N/A'}
      </span>
      <span className="justify-self-end text-[13px] font-medium text-neutral-900">{trade.quantity}</span>
      <span className="justify-self-end text-[13px] font-medium text-neutral-900">
        ₹{(trade.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className="text-center text-[13px] text-neutral-600">{trade.exchange}</span>
      <span
        className={cn(
          'justify-self-center rounded px-2 py-0.5 text-[11px] font-medium',
          getStatusColor(trade.status)
        )}
      >
        {trade.status}
      </span>
      <span className="justify-self-end text-xs text-neutral-400">
        {formatDate(trade.timestamp || trade.createdAt)}
      </span>
    </div>
  );
}


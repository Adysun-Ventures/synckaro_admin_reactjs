import { Trade } from '@/types';
import { cn } from '@/lib/utils';

interface CompactTradeRowProps {
  trade: Trade;
}

export function CompactTradeRow({ trade }: CompactTradeRowProps) {
  const isBuy = trade.type === 'BUY';
  
  const statusColors = {
    pending: 'bg-warning-100 text-warning-800 border border-warning-200',
    executed: 'bg-success-100 text-success-800 border border-success-200',
    failed: 'bg-danger-100 text-danger-800 border border-danger-200',
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
        'flex items-center gap-4 px-4 py-3 border-l-[3px] transition-colors hover:bg-neutral-50/50',
        isBuy
          ? 'border-success-500 bg-success-50/20'
          : 'border-danger-500 bg-danger-50/20'
      )}
    >
      {/* Stock Name - 140px */}
      <div className="w-[140px] flex-shrink-0">
        <span className="text-sm font-semibold text-neutral-900">{trade.stock}</span>
      </div>
      
      {/* Type Badge - 60px */}
      <div className="w-[60px] flex-shrink-0">
        <span
          className={cn(
            'inline-block px-2 py-0.5 rounded text-[11px] font-semibold border',
            isBuy
              ? 'bg-success-100 text-success-800 border-success-200'
              : 'bg-danger-100 text-danger-800 border-danger-200'
          )}
        >
          {trade.type}
        </span>
      </div>
      
      {/* Quantity - 80px */}
      <div className="w-[80px] flex-shrink-0 text-right">
        <span className="text-[13px] font-medium text-neutral-900">{trade.quantity}</span>
      </div>
      
      {/* Price - 120px */}
      <div className="w-[120px] flex-shrink-0 text-right">
        <span className="text-[13px] font-medium text-neutral-900">
          ₹{(trade.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      
      {/* Exchange - 80px */}
      <div className="w-[80px] flex-shrink-0 text-center">
        <span className="text-[13px] text-neutral-600">{trade.exchange}</span>
      </div>
      
      {/* Status - 100px */}
      <div className="w-[100px] flex-shrink-0">
        <span
          className={cn(
            'inline-block px-2 py-0.5 rounded text-[11px] font-medium',
            statusColors[trade.status]
          )}
        >
          {trade.status}
        </span>
      </div>
      
      {/* Date - 90px */}
      <div className="w-[90px] flex-shrink-0 text-right">
        <span className="text-xs text-neutral-400">
          {formatDate(trade.timestamp || trade.createdAt)}
        </span>
      </div>
    </div>
  );
}


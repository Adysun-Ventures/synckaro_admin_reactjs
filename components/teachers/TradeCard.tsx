import { Trade } from '@/types';
import { cn } from '@/lib/utils';

interface TradeCardProps {
  trade: Trade;
}

export function TradeCard({ trade }: TradeCardProps) {
  const isBuy = trade.type === 'BUY';
  const statusColors = {
    pending: 'bg-warning-100 text-warning-700',
    executed: 'bg-success-100 text-success-700',
    failed: 'bg-danger-100 text-danger-700',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl border-l-4 p-4 transition-shadow hover:shadow-md',
        isBuy
          ? 'border-success-500 bg-success-50/30'
          : 'border-danger-500 bg-danger-50/30'
      )}
    >
      <div className="flex items-start justify-between">
        {/* Left: Stock and Type */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-neutral-900">{trade.stock}</h3>
            <span
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-semibold',
                isBuy
                  ? 'bg-success-100 text-success-700'
                  : 'bg-danger-100 text-danger-700'
              )}
            >
              {trade.type}
            </span>
          </div>
        </div>

        {/* Right: Status Badge */}
        <span
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium',
            statusColors[trade.status]
          )}
        >
          {trade.status}
        </span>
      </div>

      {/* Bottom: Trade Details */}
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Quantity</p>
          <p className="text-sm font-semibold text-neutral-900">{trade.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Price</p>
          <p className="text-sm font-semibold text-neutral-900">₹{(trade.price || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Exchange</p>
          <p className="text-sm font-semibold text-neutral-900">{trade.exchange}</p>
        </div>
      </div>

      {/* Date */}
      <div className="mt-3 text-right">
        <p className="text-xs text-neutral-400">
          {formatDate(trade.timestamp || trade.createdAt)}
        </p>
      </div>
    </div>
  );
}


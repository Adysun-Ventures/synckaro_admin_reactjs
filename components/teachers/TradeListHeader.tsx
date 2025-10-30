export function TradeListHeader() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-neutral-50 border-b border-neutral-200 sticky top-0 z-10">
      {/* Stock Name - 140px */}
      <div className="w-[140px] flex-shrink-0">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Stock
        </span>
      </div>
      
      {/* Type Badge - 60px */}
      <div className="w-[60px] flex-shrink-0">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Type
        </span>
      </div>
      
      {/* Quantity - 80px */}
      <div className="w-[80px] flex-shrink-0 text-right">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Qty
        </span>
      </div>
      
      {/* Price - 120px */}
      <div className="w-[120px] flex-shrink-0 text-right">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Price
        </span>
      </div>
      
      {/* Exchange - 80px */}
      <div className="w-[80px] flex-shrink-0 text-center">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Exchange
        </span>
      </div>
      
      {/* Status - 100px */}
      <div className="w-[100px] flex-shrink-0">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Status
        </span>
      </div>
      
      {/* Date - 90px */}
      <div className="w-[90px] flex-shrink-0 text-right">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Date
        </span>
      </div>
    </div>
  );
}


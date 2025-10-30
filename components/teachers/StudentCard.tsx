import { Student } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Toggle } from '@/components/common/Toggle';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  onToggleStatus?: (studentId: string, newStatus: 'active' | 'inactive') => void;
}

export function StudentCard({ student, onToggleStatus }: StudentCardProps) {
  const pnl = (student.currentCapital || 0) - (student.initialCapital || 0);
  const isPositive = pnl >= 0;
  const isActive = student.status === 'active';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggle = () => {
    if (onToggleStatus) {
      onToggleStatus(student.id, isActive ? 'inactive' : 'active');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar name={student.name} size="md" showStatus statusColor={isActive ? 'success' : 'danger'} />
        
        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-neutral-900 truncate">{student.name}</h4>
          <p className="text-sm text-neutral-500 truncate">{student.email}</p>
        </div>
        
        {/* Capital and Risk */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs text-neutral-500">Capital</p>
              <p className={cn(
                'text-sm font-semibold',
                isPositive ? 'text-success-600' : 'text-danger-600'
              )}>
                {formatCurrency(student.currentCapital || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Risk</p>
              <p className="text-sm font-medium text-neutral-600">
                {student.riskPercentage || 0}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Toggle */}
        <Toggle
          enabled={isActive}
          onChange={handleToggle}
          aria-label={`Toggle ${student.name} status`}
        />
      </div>
    </div>
  );
}


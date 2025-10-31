import { Student } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { Toggle } from '@/components/common/Toggle';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    <div className="group relative">
      <Link
        href={`/students/${student.id}`}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`View ${student.name}'s profile`}
      />
      <div className="pointer-events-none rounded-xl border border-neutral-200 bg-white p-4 transition-shadow group-hover:shadow-md">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="pointer-events-auto">
            <Avatar
              name={student.name}
              size="md"
              showStatus
              statusColor={isActive ? 'success' : 'danger'}
            />
          </div>

          {/* Student Info */}
          <div className="min-w-0 flex-1">
            <h4 className="truncate font-medium text-neutral-900">{student.name}</h4>
            <p className="truncate text-sm text-neutral-500">{student.email}</p>
          </div>

          {/* Capital and Risk */}
          <div className="pointer-events-none text-right">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-neutral-500">Capital</p>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isPositive ? 'text-success-600' : 'text-danger-600'
                  )}
                >
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
          <div className="pointer-events-auto">
            <Toggle
              enabled={isActive}
              onChange={handleToggle}
              aria-label={`Toggle ${student.name} status`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}




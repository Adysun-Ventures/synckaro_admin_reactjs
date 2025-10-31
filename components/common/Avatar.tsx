import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | '2xl';
  className?: string;
  showStatus?: boolean;
  statusColor?: 'success' | 'danger' | 'warning';
}

// Generate consistent color from name hash
const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-primary-500',
    'bg-success-500',
    'bg-warning-500',
    'bg-danger-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-cyan-500',
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export function Avatar({ name, size = 'md', className, showStatus, statusColor = 'success' }: AvatarProps) {
  const bgColor = getColorFromName(name);
  const initials = getInitials(name);
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
  };
  
  const statusColors = {
    success: 'bg-success-500',
    danger: 'bg-danger-500',
    warning: 'bg-warning-500',
  };
  
  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4',
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full text-white font-semibold',
          bgColor,
          sizeClasses[size]
        )}
      >
        {initials}
      </div>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusColors[statusColor],
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}




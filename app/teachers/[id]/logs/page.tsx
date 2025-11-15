'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { storage } from '@/lib/storage';
import { Teacher, ActivityLog } from '@/types';
import { isAuthenticated } from '@/services/authService';
import { cn } from '@/lib/utils';

type ActionType = 'all' | 'trade_executed' | 'student_added' | 'profile_updated' | 'profile_created';

export default function TeacherLogsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterAction, setFilterAction] = useState<ActionType>('all');
  const [isReloading, setIsReloading] = useState(false);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load data
  const loadData = useCallback(() => {
    const teachers = storage.getItem('teachers') || [];
    const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId);
    
    if (!foundTeacher) {
      router.push('/teachers');
      return;
    }
    
    setTeacher(foundTeacher);

    // Load activity logs for this teacher
    const allLogs = storage.getItem('activityLogs') || [];
    let teacherLogs = allLogs.filter((log: ActivityLog) => log.teacherId === teacherId);
    
    // Hardcoded fallback data if no logs found
    if (teacherLogs.length === 0) {
      const now = new Date();
      teacherLogs = [
        {
          id: 'log-1',
          teacherId: teacherId,
          action: 'trade_executed' as const,
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          details: 'Executed BUY order for INFY - 30 shares at ₹1,610.50',
        },
        {
          id: 'log-2',
          teacherId: teacherId,
          action: 'student_added' as const,
          timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          details: 'Added new student: Rahul Verma with initial capital of ₹1,20,000',
        },
        {
          id: 'log-3',
          teacherId: teacherId,
          action: 'trade_executed' as const,
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          details: 'Executed SELL order for TCS - 20 shares at ₹3,680.00',
        },
        {
          id: 'log-4',
          teacherId: teacherId,
          action: 'profile_updated' as const,
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          details: 'Updated profile information: Changed specialization to Intraday Trading',
        },
        {
          id: 'log-5',
          teacherId: teacherId,
          action: 'trade_executed' as const,
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          details: 'Executed BUY order for RELIANCE - 15 shares at ₹2,450.00',
        },
        {
          id: 'log-6',
          teacherId: teacherId,
          action: 'student_added' as const,
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          details: 'Added new student: Pooja Nair with initial capital of ₹90,000',
        },
        {
          id: 'log-7',
          teacherId: teacherId,
          action: 'profile_created' as const,
          timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          details: 'Teacher profile created and activated in the system',
        },
      ];
    }
    setLogs(teacherLogs);
  }, [teacherId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      loadData();
      setIsReloading(false);
    }, 200);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (filterAction === 'all') return logs;
    return logs.filter(log => log.action === filterAction);
  }, [logs, filterAction]);

  // Export to CSV
  const handleExport = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Date', 'Time', 'Action', 'Details'];
    const rows = filteredLogs.map(log => {
      const date = new Date(log.timestamp);
      return [
        date.toLocaleDateString('en-IN'),
        date.toLocaleTimeString('en-IN'),
        log.action.replace(/_/g, ' ').toUpperCase(),
        log.details,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teacher?.name.replace(' ', '_')}_activity_logs.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated() || !teacher) {
    return null;
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'student_added':
        return <UserPlusIcon className="h-5 w-5 text-success-600" />;
      case 'trade_executed':
        return <ChartBarIcon className="h-5 w-5 text-primary-600" />;
      case 'profile_updated':
      case 'profile_created':
        return <UserCircleIcon className="h-5 w-5 text-warning-600" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'student_added':
        return 'bg-success-100';
      case 'trade_executed':
        return 'bg-primary-100';
      case 'profile_updated':
      case 'profile_created':
        return 'bg-warning-100';
      default:
        return 'bg-neutral-100';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <DashboardLayout title={`${teacher.name} - Activity Logs`}>
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/teachers/${teacherId}`)}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Activity Logs</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReload}
              disabled={isReloading}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowPathIcon className={cn('h-4 w-4', isReloading && 'animate-spin')} />
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <div className="hidden md:block">
              <input
                type="search"
                placeholder="Search"
                className="h-9 w-48 rounded-3xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-neutral-700">Filter by Action:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterAction('all')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterAction === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                All ({logs.length})
              </button>
              <button
                onClick={() => setFilterAction('trade_executed')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterAction === 'trade_executed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                Trades ({logs.filter(l => l.action === 'trade_executed').length})
              </button>
              <button
                onClick={() => setFilterAction('student_added')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterAction === 'student_added'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                Students ({logs.filter(l => l.action === 'student_added').length})
              </button>
              <button
                onClick={() => setFilterAction('profile_updated')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterAction === 'profile_updated'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                Profile Updates ({logs.filter(l => l.action === 'profile_updated' || l.action === 'profile_created').length})
              </button>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <EmptyState
              title="No activity logs"
              description="No activity found for the selected filter"
            />
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', getActionColor(log.action))}>
                      {getActionIcon(log.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-neutral-600 mt-1">
                            {log.details}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-xs text-neutral-500">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredLogs.length > 0 && (
          <div className="text-center text-sm text-neutral-500">
            Showing {filteredLogs.length} of {logs.length} total activities
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';
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

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load data
  useEffect(() => {
    const teachers = storage.getItem('teachers') || [];
    const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId);
    
    if (!foundTeacher) {
      router.push('/teachers');
      return;
    }
    
    setTeacher(foundTeacher);

    // Load activity logs for this teacher
    const allLogs = storage.getItem('activityLogs') || [];
    const teacherLogs = allLogs.filter((log: ActivityLog) => log.teacherId === teacherId);
    setLogs(teacherLogs);
  }, [teacherId, router]);

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
        {/* Back Button */}
        <Link
          href={`/teachers/${teacherId}`}
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Teacher Details
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">{teacher.name}</h2>
            <p className="text-neutral-600">Activity Logs</p>
          </div>
          <Button
            variant="secondary"
            onClick={handleExport}
            disabled={filteredLogs.length === 0}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
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


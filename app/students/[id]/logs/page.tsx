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
import { Student, ActivityLog } from '@/types';
import { isAuthenticated } from '@/services/authService';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { Card } from '@/components/common/Card';

type ActionType = 'all' | 'trade_executed' | 'profile_updated' | 'profile_created' | 'teacher_assigned' | 'teacher_reassigned';

export default function StudentLogsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterAction, setFilterAction] = useState<ActionType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load data from API
  const loadData = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      const studentIdNum = parseInt(studentId, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID');
      }

      const response = await apiClient.post<{
        success: boolean;
        data: {
          trades: Array<{
            id: number;
            student_id: number;
            action: string;
            timestamp: string;
            details: string;
          }>;
          teachers: Array<{
            id: number;
            student_id: number;
            action: string;
            timestamp: string;
            details: string;
          }>;
          profile_updates: Array<{
            id: number;
            student_id: number;
            action: string;
            timestamp: string;
            details: string;
          }>;
        };
      }>('/admin/student/logs', {
        student_id: studentIdNum,
      });

      if (response.data && response.data.success && response.data.data) {
        const apiData = response.data.data;

        // Map student data (we'll get basic info from API if needed, for now use minimal)
        const mappedStudent: Student = {
          id: String(studentIdNum),
          name: 'Student',
          email: '',
          mobile: '',
          teacherId: '',
          status: 'active',
          initialCapital: 0,
          currentCapital: 0,
          joinedDate: new Date().toISOString(),
        };
        setStudent(mappedStudent);

        // Combine all logs into one array
        const allLogs: ActivityLog[] = [
          ...apiData.trades.map((log) => ({
            id: String(log.id),
            teacherId: '',
            action: log.action as ActivityLog['action'],
            timestamp: log.timestamp,
            details: log.details,
          })),
          ...apiData.teachers.map((log) => ({
            id: String(log.id),
            teacherId: '',
            action: log.action as ActivityLog['action'],
            timestamp: log.timestamp,
            details: log.details,
          })),
          ...apiData.profile_updates.map((log) => ({
            id: String(log.id),
            teacherId: '',
            action: log.action as ActivityLog['action'],
            timestamp: log.timestamp,
            details: log.details,
          })),
        ];

        // Sort by timestamp (most recent first)
        const sortedLogs = allLogs.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        });

        setLogs(sortedLogs);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching student logs:', err);
      setError(err?.error || err?.message || 'Failed to fetch student logs');
    } finally {
      setLoading(false);
    }
  }, [studentId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await loadData();
    } finally {
      setIsReloading(false);
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (filterAction === 'all') return logs;
    if (filterAction === 'profile_updated') {
      return logs.filter(log => log.action === 'profile_updated' || log.action === 'profile_created');
    }
    if (filterAction === 'teacher_assigned') {
      return logs.filter(log => log.action === 'teacher_assigned' || log.action === 'teacher_reassigned');
    }
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
    a.download = `${student?.name.replace(' ', '_')}_activity_logs.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated()) {
    return null;
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'trade_executed':
        return <ChartBarIcon className="h-5 w-5 text-primary-600" />;
      case 'profile_updated':
      case 'profile_created':
        return <UserCircleIcon className="h-5 w-5 text-warning-600" />;
      case 'teacher_assigned':
      case 'teacher_reassigned':
        return <UserPlusIcon className="h-5 w-5 text-success-600" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'trade_executed':
        return 'bg-primary-100';
      case 'profile_updated':
      case 'profile_created':
        return 'bg-warning-100';
      case 'teacher_assigned':
      case 'teacher_reassigned':
        return 'bg-success-100';
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
    <DashboardLayout title={student ? `${student.name} - Activity Logs` : 'Student Activity Logs'}>
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/students/${studentId}`)}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Student Activity Logs</h2>
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

        {/* Error Message */}
        {error && (
          <Card padding="lg">
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p className="text-sm text-neutral-600">Loading activity logs...</p>
            </div>
          </Card>
        )}

        {/* Filters */}
        {!loading && (
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
              <button
                onClick={() => setFilterAction('teacher_assigned')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  filterAction === 'teacher_assigned'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                )}
              >
                Teacher ({logs.filter(l => l.action === 'teacher_assigned' || l.action === 'teacher_reassigned').length})
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Activity Timeline */}
        {!loading && (
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
        )}

        {/* Summary */}
        {!loading && filteredLogs.length > 0 && (
          <div className="text-center text-sm text-neutral-500">
            Showing {filteredLogs.length} of {logs.length} total activities
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


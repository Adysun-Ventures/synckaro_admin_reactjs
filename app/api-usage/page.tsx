'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/common/Table';
import apiClient from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

type ApiLogEntry = {
  id: number;
  endpoint: string;
  hit_count: number;
  execution_time_ms: number;
};

type ApiLogsResponse = {
  status: string;
  data: ApiLogEntry[];
};

export default function ApiUsagePage() {
  const router = useRouter();
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchApiLogs = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const { silent = false } = options;
    if (!isAuthenticated || !token) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await apiClient.post<ApiLogsResponse>(
          '/admin/api-logs',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          setLogs(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching API logs:', err);
        const message =
          err?.response?.data?.message || err?.message || 'Failed to fetch API logs';
        setError(message);
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [isAuthenticated, token]
  );

  useEffect(() => {
    if (!authLoading && isAuthenticated && token) {
      fetchApiLogs();
    }
  }, [authLoading, isAuthenticated, token, fetchApiLogs]);

  const totalHits = useMemo(
    () => logs.reduce((sum, log) => sum + (log.hit_count || 0), 0),
    [logs]
  );

  const averageExecutionTime = useMemo(() => {
    if (!logs.length) return 0;
    const totalTime = logs.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0);
    return totalTime / logs.length;
  }, [logs]);

  if (authLoading || !isAuthenticated || !token) {
    return null;
  }

  return (
    <DashboardLayout title="API Usage">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-neutral-500">Tracked Endpoints</p>
            <p className="text-3xl font-semibold text-neutral-900">{logs.length || '--'}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Total Hits</p>
            <p className="text-3xl font-semibold text-neutral-900">
              {totalHits ? totalHits.toLocaleString('en-IN') : '--'}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Avg Execution Time</p>
            <p className="text-3xl font-semibold text-neutral-900">
              {logs.length ? `${averageExecutionTime.toFixed(2)} ms` : '--'}
            </p>
          </Card>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 pb-3 pt-5">
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-semibold text-neutral-900">
                  API Invocation Logs
                </div>
              </div>
              <div className="flex w-full justify-start md:w-auto md:justify-end">
                <span
                  onClick={() => fetchApiLogs({ silent: true })}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-[599px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Hit Count</TableHead>
                    <TableHead>Execution Time (ms)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {error && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-danger-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}
                  {!error && logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-neutral-500">
                        No API activity logged yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {!error &&
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium text-neutral-900">{log.id}</TableCell>
                        <TableCell>{log.endpoint}</TableCell>
                        <TableCell>{log.hit_count.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{log.execution_time_ms.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



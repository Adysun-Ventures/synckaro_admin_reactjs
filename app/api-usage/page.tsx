'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchApiLogs = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
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
      setLoading(false);
    }
  }, [isAuthenticated, token]);

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

        <Card
          header={
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-neutral-900">API Invocation Logs</p>
                <p className="text-sm text-neutral-500">
                  Latest data from <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/admin/api-logs</code>
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchApiLogs} loading={loading}>
                Refresh
              </Button>
            </div>
          }
        >
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
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-neutral-500">
                    Fetching latest API usage…
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-danger-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-neutral-500">
                    No API activity logged yet.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
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
        </Card>
      </div>
    </DashboardLayout>
  );
}



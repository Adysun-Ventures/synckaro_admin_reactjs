'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
  import { ArrowPathIcon } from '@heroicons/react/24/outline';
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

type TableCountEntry = {
  table_name: string;
  count: number;
};

type TableCountsResponse = {
  status: string;
  data: TableCountEntry[];
};

export default function DbTableCountPage() {
  const router = useRouter();
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();
  const [tableCounts, setTableCounts] = useState<TableCountEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchTableCounts = useCallback(
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
        const response = await apiClient.post<TableCountsResponse>(
          '/admin/db/table-counts',
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          setTableCounts(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error fetching table counts:', err);
        const message =
          err?.response?.data?.message || err?.message || 'Failed to fetch table counts';
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
      fetchTableCounts();
    }
  }, [authLoading, isAuthenticated, token, fetchTableCounts]);

  const totalTables = useMemo(() => tableCounts.length, [tableCounts]);
  const totalRows = useMemo(
    () => tableCounts.reduce((sum, entry) => sum + (entry.count || 0), 0),
    [tableCounts]
  );
  const busiestTable = useMemo(() => {
    if (!tableCounts.length) return null;
    return tableCounts.reduce((prev, curr) => (curr.count > prev.count ? curr : prev));
  }, [tableCounts]);

  if (authLoading || !isAuthenticated || !token) {
    return null;
  }

  return (
    <DashboardLayout title="DB Table Count">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="text-sm text-neutral-500">Tracked Tables</p>
            <p className="text-3xl font-semibold text-neutral-900">{totalTables || '--'}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Total Rows</p>
            <p className="text-3xl font-semibold text-neutral-900">
              {totalRows ? totalRows.toLocaleString('en-IN') : '--'}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Busiest Table</p>
            <p className="text-3xl font-semibold text-neutral-900">
              {busiestTable ? busiestTable.table_name : '--'}
            </p>
            {busiestTable && (
              <p className="mt-1 text-sm text-neutral-500">
                {busiestTable.count.toLocaleString('en-IN')} rows
              </p>
            )}
          </Card>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-4 pb-3 pt-5">
            <div className="flex flex-wrap items-center gap-3 md:gap-6">
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-semibold text-neutral-900">
                  Database Table Counts
                </div>
              </div>
              <div className="flex w-full justify-start md:w-auto md:justify-end">
                <span
                  onClick={() => fetchTableCounts({ silent: true })}
                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead className="text-right">Row Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {error && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-danger-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  )}
                  {!error && tableCounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-neutral-500">
                        No tables found.
                      </TableCell>
                    </TableRow>
                  )}
                  {!error &&
                    tableCounts.map((entry) => (
                      <TableRow key={entry.table_name}>
                        <TableCell className="font-medium text-neutral-900">
                          {entry.table_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.count.toLocaleString('en-IN')}
                        </TableCell>
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



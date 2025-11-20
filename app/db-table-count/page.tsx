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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchTableCounts = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    setLoading(true);
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
      setLoading(false);
    }
  }, [isAuthenticated, token]);

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

        <Card
          header={
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-neutral-900">Database Table Counts</p>
                <p className="text-sm text-neutral-500">
                  Data sourced from{' '}
                  <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">
                    /admin/db/table-counts
                  </code>
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={fetchTableCounts} loading={loading}>
                Refresh
              </Button>
            </div>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead className="text-right">Row Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-neutral-500">
                    Loading table counts…
                  </TableCell>
                </TableRow>
              )}
              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-danger-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}
              {!loading && !error && tableCounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-neutral-500">
                    No tables found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                !error &&
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
        </Card>
      </div>
    </DashboardLayout>
  );
}



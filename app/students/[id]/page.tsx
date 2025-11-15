'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Toggle } from '@/components/common/Toggle';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { TradeListHeader } from '@/components/teachers/TradeListHeader';
import { CompactTradeRow } from '@/components/teachers/CompactTradeRow';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { isAuthenticated } from '@/services/authService';
import { Student, Teacher, Trade } from '@/types';
import apiClient from '@/lib/api';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

// Helper function to format date from "DD MMM YYYY HH:MM:SS AM/PM" format
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  // If date is already in "DD MMM YYYY HH:MM:SS AM/PM" format, extract just the date part
  // Format: "11 Nov 2025 12:35:45 PM" -> "11 Nov 2025"
  const dateMatch = dateString.match(/^(\d{1,2}\s+\w{3}\s+\d{4})/);
  if (dateMatch) {
    return dateMatch[1];
  }
  // Fallback: try to parse as Date object
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const PAGE_SIZE_OPTIONS = [50, 100, 200, 300];

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

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
      // Fetch student from API
      const studentIdNum = parseInt(studentId, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID');
      }

      // Get student name from localStorage if available
      const students = storage.getItem('students') || [];
      const localStudent = students.find((s: Student) => s.id === studentId);
      const studentName = localStudent?.name || student?.name || '';

      const response = await apiClient.post<{
        success: boolean;
        data: {
          student_id: number;
          student_name: string;
          email: string;
          mobile: string;
          status: string;
          teacher_id: number;
          teacher_name: string;
          initial_capital: number;
          current_capital: number;
          risk_percent: number;
          strategy?: string;
          joined_on: string; // Format: "DD MMM YYYY HH:MM:SS AM/PM" (e.g., "11 Nov 2025 12:35:45 PM")
          last_updated: string; // Format: "DD MMM YYYY HH:MM:SS AM/PM" (e.g., "11 Nov 2025 12:35:45 PM")
          recent_trades: Array<{
            stock: string;
            type: string;
            qty: number;
            price: number;
            exchange: string;
            status: string;
            date: string; // Format: "DD MMM YYYY HH:MM:SS AM/PM" (e.g., "11 Nov 2025 12:35:45 PM")
          }>;
        };
      }>('/admin/student/view', {
        student_id: studentIdNum,
        student_name: studentName,
      });

      if (response.data && response.data.success && response.data.data) {
        const apiData = response.data.data;

        // Map API response to Student type
        const mappedStudent: Student = {
          id: String(apiData.student_id),
          name: apiData.student_name,
          email: apiData.email,
          mobile: apiData.mobile,
          teacherId: String(apiData.teacher_id),
          teacherName: apiData.teacher_name,
          status: apiData.status as 'active' | 'inactive',
          initialCapital: apiData.initial_capital,
          currentCapital: apiData.current_capital,
          profitLoss: apiData.current_capital - apiData.initial_capital,
          riskPercentage: apiData.risk_percent,
          strategy: apiData.strategy,
          joinedDate: apiData.joined_on,
        };

        setStudent(mappedStudent);

        // Map teacher data
        const mappedTeacher: Teacher = {
          id: String(apiData.teacher_id),
          name: apiData.teacher_name,
          email: '',
          mobile: '',
          doj: '',
          status: 'active',
          totalStudents: 0,
          totalTrades: 0,
          joinedDate: '',
        };
        setTeacher(mappedTeacher);

        // Helper function to parse date from "DD MMM YYYY HH:MM:SS AM/PM" format
        const parseDateString = (dateStr: string): Date => {
          try {
            return new Date(dateStr);
          } catch {
            return new Date();
          }
        };

        // Map recent trades from API
        let mappedTrades: Trade[] = apiData.recent_trades.map((trade, index) => ({
          id: `trade-${apiData.student_id}-${index}`,
          teacherId: String(apiData.teacher_id),
          teacherName: apiData.teacher_name,
          studentId: String(apiData.student_id),
          studentName: apiData.student_name,
          stock: trade.stock,
          quantity: trade.qty,
          price: trade.price,
          type: trade.type as 'BUY' | 'SELL',
          exchange: trade.exchange as 'NSE' | 'BSE',
          status: trade.status as 'pending' | 'executed' | 'completed' | 'failed' | 'cancelled',
          createdAt: trade.date,
          timestamp: trade.date,
        }));

        // TODO: Remove hardcoded fallback - Replace with actual API response when backend provides recent_trades
        // Hardcoded fallback data if no trades from API
        if (mappedTrades.length === 0) {
          const now = new Date();
          mappedTrades = [
            {
              id: 'trade-1',
              teacherId: String(apiData.teacher_id),
              teacherName: apiData.teacher_name,
              studentId: String(apiData.student_id),
              studentName: apiData.student_name,
              stock: 'INFY',
              quantity: 30,
              price: 1610.5,
              type: 'BUY' as const,
              exchange: 'NSE' as const,
              status: 'executed' as const,
              createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              pnl: 4500,
            },
            {
              id: 'trade-2',
              teacherId: String(apiData.teacher_id),
              teacherName: apiData.teacher_name,
              studentId: String(apiData.student_id),
              studentName: apiData.student_name,
              stock: 'TCS',
              quantity: 20,
              price: 3680.0,
              type: 'SELL' as const,
              exchange: 'BSE' as const,
              status: 'executed' as const,
              createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              pnl: 3200,
            },
          ];
        }

        // Sort trades by date (most recent first)
        const sortedTrades = mappedTrades.sort((a, b) => {
          const dateA = parseDateString(a.timestamp || a.createdAt).getTime();
          const dateB = parseDateString(b.timestamp || b.createdAt).getTime();
          return dateB - dateA;
        });

        setTrades(sortedTrades);
        setCurrentPage(1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching student:', err);
      setError(err?.error || err?.message || 'Failed to fetch student');

      // Fallback to localStorage on error
      const students = storage.getItem('students') || [];
      const foundStudent = students.find((s: Student) => s.id === studentId);

      if (!foundStudent) {
        router.push('/teachers');
        return;
      }

      setStudent(foundStudent);

      const teachers = storage.getItem('teachers') || [];
      const relatedTeacher = teachers.find((t: Teacher) => t.id === foundStudent.teacherId) || null;
      setTeacher(relatedTeacher);

      const allTrades = storage.getItem('trades') || [];
      const studentTrades = allTrades
        .filter((trade: Trade) => trade.studentId === studentId)
        .sort((a: Trade, b: Trade) => {
          const dateA = new Date(a.timestamp || a.createdAt).getTime();
          const dateB = new Date(b.timestamp || b.createdAt).getTime();
          return dateB - dateA;
        });

      setTrades(studentTrades);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [studentId, router, student]);

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

  const pnl = useMemo(() => {
    if (!student) return 0;
    return (student.currentCapital || 0) - (student.initialCapital || 0);
  }, [student]);

  const isPositive = pnl >= 0;

  const handleStatusToggle = (enabled: boolean) => {
    if (!student) return;

    const students = storage.getItem('students') || [];
    const updatedStudents = students.map((s: Student) =>
      s.id === student.id ? { ...s, status: enabled ? 'active' : 'inactive' } : s
    );

    storage.setItem('students', updatedStudents);

    const nextStudent = updatedStudents.find((s: Student) => s.id === student.id) || null;
    setStudent(nextStudent);
  };

  const totalTrades = trades.length;
  const totalPages = Math.max(1, Math.ceil(totalTrades / pageSize));

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalTrades / pageSize));
    setCurrentPage((prev) => (prev > maxPage ? maxPage : prev));
  }, [totalTrades, pageSize]);

  const paginatedTrades = useMemo(() => {
    if (totalTrades === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * pageSize;
    return trades.slice(startIndex, startIndex + pageSize);
  }, [currentPage, trades, totalTrades, pageSize]);


  if (!student || !isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout title="Student Profile">
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Student Details</h2>
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
            <div className="hidden md:block">
              <input
                type="search"
                placeholder="Search"
                className="h-9 w-48 rounded-3xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Header Card */}
        <Card
          padding="lg"
          tone="neutral"
          hover
          header={
            <>
              <div className="flex items-center gap-3">
                <Avatar
                  name={student.name}
                  size="2xl"
                  showStatus
                  statusColor={student.status === 'active' ? 'success' : 'danger'}
                />
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">{student.name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DevicePhoneMobileIcon className="h-4 w-4" />
                      <span>{student.mobile}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Joined {formatDate(student.joinedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/students/${studentId}/stats`} className="inline-flex">
                  <Button variant="secondary" size="sm">
                    <ChartBarIcon className="mr-1 h-4 w-4" />
                    View Statistics
                  </Button>
                </Link>
                <Link href={`/students/${studentId}/logs`} className="inline-flex">
                  <Button variant="secondary" size="sm">
                    <ClockIcon className="mr-1 h-4 w-4" />
                    View Logs
                  </Button>
                </Link>
                {teacher && (
                  <Link href={`/teachers/${teacher.id}`} className="inline-flex">
                    <Button variant="secondary" size="sm">
                      <UserGroupIcon className="mr-1 h-4 w-4" />
                      View Teacher
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">Status</span>
                  <Toggle enabled={student.status === 'active'} onChange={handleStatusToggle} />
                </div>
              </div>
            </>
          }
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
              <span>Last synced {new Date().toLocaleTimeString()}</span>
              <span>Teacher: {teacher?.name ?? 'Unassigned'} • Total Trades: {trades.length}</span>
            </div>
          }
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <p className="text-sm text-neutral-600">
                {student.strategy || 'No strategy documented yet.'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>Risk: {student.riskPercentage || 0}%</span>
              <span>P&L: {formatCurrency(pnl)}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card padding="lg">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Initial Capital</p>
            <p className="mt-1 text-3xl font-semibold text-neutral-900">
              {formatCurrency(student.initialCapital || 0)}
            </p>
          </Card>
          <Card padding="lg">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Current Capital</p>
            <p className="mt-1 text-3xl font-semibold text-neutral-900">
              {formatCurrency(student.currentCapital || 0)}
            </p>
          </Card>
          <Card padding="lg">
            <p className="text-xs uppercase tracking-wide text-neutral-500">P&amp;L</p>
            <p
              className={cn(
                'mt-1 text-3xl font-semibold',
                isPositive ? 'text-success-600' : 'text-danger-600'
              )}
            >
              {formatCurrency(pnl)}
            </p>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Trades</h2>
            <span className="text-sm text-neutral-500">{trades.length} total</span>
          </div>

          {trades.length === 0 ? (
            <Card>
              <EmptyState
                title="No trades yet"
                description="This student hasn't executed any trades."
              />
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <TradeListHeader />
              <div className="divide-y divide-neutral-100">
                {paginatedTrades.map((trade) => (
                  <CompactTradeRow key={trade.id} trade={trade} />
                ))}
              </div>
              <PaginationFooter
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalTrades}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


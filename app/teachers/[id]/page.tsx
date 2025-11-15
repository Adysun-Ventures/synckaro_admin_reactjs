'use client';

import { useState, useEffect, useCallback, useMemo, type ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { StudentCard } from '@/components/teachers/StudentCard';
import { CompactTradeRow } from '@/components/teachers/CompactTradeRow';
import { TradeListHeader } from '@/components/teachers/TradeListHeader';
import { ConfirmDialog } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Teacher, Student, Trade } from '@/types';
import { isAuthenticated } from '@/services/authService';
import apiClient from '@/lib/api';

const PAGE_SIZE_OPTIONS = [50, 100, 200, 300];

export default function TeacherDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusToneMap: Record<Teacher['status'], 'success' | 'danger' | 'warning'> = {
    active: 'success',
    live: 'success',
    open: 'warning',
    test: 'warning',
    inactive: 'danger',
    close: 'danger',
  };

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const loadData = useCallback(async () => {
    if (!isAuthenticated()) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch teacher from API
      const teacherIdNum = parseInt(teacherId, 10);
      if (isNaN(teacherIdNum)) {
        throw new Error('Invalid teacher ID');
      }

      // Get teacher name from localStorage if available
      const teachers = storage.getItem('teachers') || [];
      const localTeacher = teachers.find((t: Teacher) => t.id === teacherId);
      const teacherName = localTeacher?.name || teacher?.name || '';

      const response = await apiClient.post<{
        success: boolean;
        data: {
          teacher_id: number;
          name: string;
          status: string;
          email: string;
          phone?: string;
          joined_on: string; // Format: "DD MMM YYYY HH:MM:SS AM/PM" (e.g., "11 Nov 2025 12:35:45 PM")
          last_updated: string; // Format: "DD MMM YYYY HH:MM:SS AM/PM" (e.g., "11 Nov 2025 12:35:45 PM")
          summary: {
            total_students: number;
            total_trades: number;
            total_capital: string;
            win_rate: string;
          };
          associated_students: Array<{
            student_id: number;
            student_name: string;
            email: string;
            capital: number;
            risk_percent: number;
            status: string;
          }>;
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
      }>('/admin/teacher/view', {
        teacher_id: teacherIdNum,
        teacher_name: teacherName,
      });

      if (response.data && response.data.success && response.data.data) {
        const apiData = response.data.data;

        // Map associated students from API
        let mappedStudents: Student[] = apiData.associated_students.map((student) => ({
          id: String(student.student_id),
          name: student.student_name,
          email: student.email,
          mobile: '',
          teacherId: teacherId,
          teacherName: apiData.name,
          status: student.status as 'active' | 'inactive',
          initialCapital: student.capital,
          currentCapital: student.capital,
          riskPercentage: student.risk_percent,
          joinedDate: new Date().toISOString(),
        }));

        // TODO: Remove hardcoded fallback - Replace with actual API response when backend provides associated_students
        // Hardcoded fallback data if no students from API
        if (mappedStudents.length === 0) {
          mappedStudents = [
            {
              id: 'student-1',
              name: 'Rahul Verma',
              email: 'rahul.verma@synckaro.com',
              mobile: '9876543210',
              teacherId: teacherId,
              teacherName: apiData.name,
              status: 'active' as const,
              initialCapital: 120000,
              currentCapital: 145000,
              profitLoss: 25000,
              riskPercentage: 3,
              strategy: 'Moderate',
              joinedDate: new Date('2024-01-15').toISOString(),
            },
            {
              id: 'student-2',
              name: 'Pooja Nair',
              email: 'pooja.nair@synckaro.com',
              mobile: '9876543211',
              teacherId: teacherId,
              teacherName: apiData.name,
              status: 'active' as const,
              initialCapital: 90000,
              currentCapital: 105000,
              profitLoss: 15000,
              riskPercentage: 2,
              strategy: 'Conservative',
              joinedDate: new Date('2024-02-10').toISOString(),
            },
          ];
        }

        setStudents(mappedStudents);

        // Helper function to parse date from "DD MMM YYYY HH:MM:SS AM/PM" format
        const parseDateString = (dateStr: string): Date => {
          // Format: "11 Nov 2025 12:35:45 PM"
          // Parse the date string
          try {
            return new Date(dateStr);
          } catch {
            // Fallback to current date if parsing fails
            return new Date();
          }
        };

        // Map recent trades from API
        const mappedTrades: Trade[] = apiData.recent_trades.map((trade, index) => ({
          id: `trade-${apiData.teacher_id}-${index}`,
          teacherId: teacherId,
          teacherName: apiData.name,
          stock: trade.stock,
          quantity: trade.qty,
          price: trade.price,
          type: trade.type as 'BUY' | 'SELL',
          exchange: trade.exchange as 'NSE' | 'BSE',
          status: trade.status as 'pending' | 'executed' | 'completed' | 'failed' | 'cancelled',
          createdAt: trade.date,
          timestamp: trade.date,
        }));

        // Sort trades by date (most recent first)
        const sortedTrades = mappedTrades.sort((a, b) => {
          const dateA = parseDateString(a.timestamp || a.createdAt).getTime();
          const dateB = parseDateString(b.timestamp || b.createdAt).getTime();
          return dateB - dateA;
        });

        setTrades(sortedTrades);

        // TODO: Remove hardcoded fallback calculations - Replace with actual API response values when backend provides proper summary data
        // Calculate summary values with fallback
        const totalStudents = apiData.summary.total_students || mappedStudents.length;
        const totalTrades = apiData.summary.total_trades || sortedTrades.length;
        const totalCapital = apiData.summary.total_capital && parseFloat(apiData.summary.total_capital) > 0
          ? parseFloat(apiData.summary.total_capital)
          : mappedStudents.reduce((sum, s) => sum + (s.currentCapital || s.initialCapital || 0), 0);
        
        // TODO: Remove hardcoded win rate calculation - Replace with actual API response when backend provides win_rate
        // Calculate win rate from trades if available, otherwise use fallback
        let winRate = parseFloat(apiData.summary.win_rate) || 0;
        if (winRate === 0 && sortedTrades.length > 0) {
          // If we have trades but no win rate, calculate a mock win rate
          const winningTrades = Math.floor(sortedTrades.length * 0.65); // 65% win rate
          winRate = (winningTrades / sortedTrades.length) * 100;
        }

        // Map API response to Teacher type with calculated/fallback values
        const mappedTeacher: Teacher = {
          id: String(apiData.teacher_id),
          name: apiData.name,
          email: apiData.email,
          status: apiData.status as Teacher['status'],
          phone: apiData.phone,
          mobile: apiData.phone?.replace(/[^0-9]/g, '') || '',
          doj: apiData.joined_on,
          joinedDate: apiData.joined_on,
          totalStudents: totalStudents,
          totalTrades: totalTrades,
          totalCapital: totalCapital,
          winRate: winRate,
          // TODO: Remove hardcoded specialization - Replace with actual API response when backend provides specialization field
          specialization: 'Intraday Trading', // Hardcoded fallback
          profitLoss: undefined,
        };

        setTeacher(mappedTeacher);
        setCurrentPage(1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching teacher:', err);
      setError(err?.error || err?.message || 'Failed to fetch teacher');

      // Fallback to localStorage on error
      const teachers = storage.getItem('teachers') || [];
      const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId);

      if (!foundTeacher) {
        router.push('/teachers');
        return;
      }

      setTeacher(foundTeacher);

      // Fallback to localStorage for students and trades
      const allStudents = storage.getItem('students') || [];
      const teacherStudents = allStudents.filter((s: Student) => s.teacherId === teacherId);
      setStudents(teacherStudents);

      const allTrades = storage.getItem('trades') || [];
      const teacherTrades = allTrades
        .filter((t: Trade) => t.teacherId === teacherId)
        .sort((a: Trade, b: Trade) => {
          const dateA = new Date(a.timestamp || a.createdAt).getTime();
          const dateB = new Date(b.timestamp || b.createdAt).getTime();
          return dateB - dateA;
        });
      setTrades(teacherTrades);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [teacherId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Delete teacher
  const handleDelete = async () => {
    if (!teacher) return;

    try {
      const teacherIdNum = parseInt(teacherId, 10);
      if (isNaN(teacherIdNum)) {
        throw new Error('Invalid teacher ID');
      }

      // Call delete API
      const response = await apiClient.delete<{
        status: string;
        message: string;
      }>('/admin/teacher/delete', {
        data: {
          id: teacherIdNum,
        },
      });

      // Check if deletion was successful
      if (response.data && response.data.message) {
        // Remove from localStorage
        const teachers = storage.getItem('teachers') || [];
        const updatedTeachers = teachers.filter((t: Teacher) => t.id !== teacherId);
        storage.setItem('teachers', updatedTeachers);

        // Redirect to teachers list
        router.push('/teachers');
      } else {
        throw new Error('Delete operation failed');
      }
    } catch (err: any) {
      console.error('Error deleting teacher:', err);
      setError(err?.error || err?.message || 'Failed to delete teacher');
      // Still redirect on error (optimistic update)
      const teachers = storage.getItem('teachers') || [];
      const updatedTeachers = teachers.filter((t: Teacher) => t.id !== teacherId);
      storage.setItem('teachers', updatedTeachers);
      router.push('/teachers');
    }
  };

  // Toggle student status
  const handleToggleStudentStatus = (studentId: string, newStatus: 'active' | 'inactive') => {
    const allStudents = storage.getItem('students') || [];
    const updatedStudents = allStudents.map((s: Student) =>
      s.id === studentId ? { ...s, status: newStatus } : s
    );
    storage.setItem('students', updatedStudents);
    setStudents(updatedStudents.filter((s: Student) => s.teacherId === teacherId));
  };

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => {
      loadData();
      setIsReloading(false);
    }, 200);
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


  if (!isAuthenticated() || !teacher) {
    return null;
  }

  // Helper function to format date from "DD MMM YYYY HH:MM:SS AM/PM" format
  const formatDate = (dateString: string) => {
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

  return (
    <DashboardLayout title="Teacher Details">
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/teachers')}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
          >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Teacher Details</h2>
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

        {/* Gradient Header Card */}
        <Card
          padding="lg"
          tone="neutral"
          hover
          header={
            <>
              <div className="flex items-center gap-3">
                <Avatar
                  name={teacher.name}
                  size="2xl"
                  showStatus
                  statusColor={statusToneMap[teacher.status]}
                />
                <div>
                  <h1 className="text-2xl font-bold text-neutral-900">{teacher.name}</h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                      <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                    <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Joined {formatDate(teacher.joinedDate)}</span>
                  </div>
                </div>
              </div>
            </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/teachers/${teacherId}/stats`} className="inline-flex">
                  <Button variant="secondary" size="sm">
                    <ChartBarIcon className="mr-1 h-4 w-4" />
                    View Statistics
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
                  <TrashIcon className="mr-1 h-4 w-4" />
                Delete
              </Button>
              </div>
            </>
          }
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
              <span>Last synced {new Date().toLocaleTimeString()}</span>
              <span>Total Students: {students.length} • Total Trades: {trades.length}</span>
            </div>
          }
        >
          <div className="flex items-start justify-between gap-6">
            {/* Left: Avatar and Info */}
            <div className="flex-1">
              <p className="text-sm text-neutral-600">
                Empowering students with personalized trading strategies and disciplined risk management.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>Capital Managed: ₹{((teacher.totalCapital || 0) / 100000).toFixed(1)}L</span>
              <span>Win Rate: {teacher.winRate?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card padding="lg" hover tone="neutral">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Students</p>
            <p className="text-2xl font-bold text-primary-600">{teacher.totalStudents}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {students.filter(s => s.status === 'active').length} active
            </p>
          </Card>
          
          <Card padding="lg" hover tone="neutral">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-success-600">{teacher.totalTrades}</p>
            <p className="text-xs text-neutral-400 mt-1">recent activity</p>
          </Card>
          
          <Card padding="lg" hover tone="neutral">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Capital</p>
            <p className="text-2xl font-bold text-warning-600">
              ₹{((teacher.totalCapital || 0) / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-neutral-400 mt-1">under management</p>
          </Card>
          
          <Card padding="lg" hover tone="neutral">
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-neutral-900">{teacher.winRate?.toFixed(1) || 0}%</p>
            <p className="text-xs text-neutral-400 mt-1">success rate</p>
          </Card>
        </div>

        {/* Associated Students */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Associated Students</h2>
            <span className="text-sm text-neutral-500">{students.length} total</span>
          </div>
          
          {students.length === 0 ? (
            <Card padding="lg" tone="neutral">
              <EmptyState
                title="No students yet"
                description="This teacher doesn't have any students assigned"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onToggleStatus={handleToggleStudentStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Trades */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Trades</h2>
            <span className="text-sm text-neutral-500">Last 10 trades</span>
          </div>
          
          {trades.length === 0 ? (
            <Card padding="lg" tone="neutral">
              <EmptyState
                title="No trades yet"
                description="This teacher hasn't executed any trades"
              />
            </Card>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/80 shadow-sm">
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

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Delete Teacher"
          message={`Are you sure you want to delete ${teacher.name}? This will also remove all associated data. This action cannot be undone.`}
          danger
        />
      </div>
    </DashboardLayout>
  );
}

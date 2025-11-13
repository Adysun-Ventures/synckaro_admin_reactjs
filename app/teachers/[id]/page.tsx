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

      const response = await apiClient.post<{
        status: string;
        data: { id: number; name: string; email: string };
      }>('/admin/teacher/view', {
        id: teacherIdNum,
      });

      if (response.data && response.data.data) {
        // Get teacher from localStorage (dummy seed data)
        const teachers = storage.getItem('teachers') || [];
        const localTeacher = teachers.find((t: Teacher) => t.id === teacherId);

        if (!localTeacher) {
          // If not found in localStorage, create minimal teacher object
          const mergedTeacher: Teacher = {
            id: String(response.data.data.id),
            name: response.data.data.name, // From API
            email: response.data.data.email, // From API
            status: response.data.status as Teacher['status'], // From API
            mobile: '',
            phone: undefined,
            totalStudents: 0,
            totalTrades: 0,
            totalCapital: undefined,
            profitLoss: undefined,
            winRate: undefined,
            specialization: undefined,
            joinedDate: new Date().toISOString(),
          };
          setTeacher(mergedTeacher);
        } else {
          // Merge: Use name, email, status from API, keep everything else from localStorage
          const mergedTeacher: Teacher = {
            ...localTeacher,
            name: response.data.data.name, // From API
            email: response.data.data.email, // From API
            status: response.data.status as Teacher['status'], // From API
            id: String(response.data.data.id), // Ensure ID matches API
          };
          setTeacher(mergedTeacher);
        }
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
    } finally {
      setLoading(false);
    }

    // Load students and trades from localStorage (dummy seed data)
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
  }, [teacherId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Delete teacher
  const handleDelete = () => {
    const teachers = storage.getItem('teachers') || [];
    const updatedTeachers = teachers.filter((t: Teacher) => t.id !== teacherId);
    storage.setItem('teachers', updatedTeachers);
    router.push('/teachers');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

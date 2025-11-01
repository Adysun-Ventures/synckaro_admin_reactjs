'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Toggle } from '@/components/common/Toggle';
import { EmptyState } from '@/components/common/EmptyState';
import { PaginationFooter } from '@/components/common/PaginationFooter';
import { TradeListHeader } from '@/components/teachers/TradeListHeader';
import { CompactTradeRow } from '@/components/teachers/CompactTradeRow';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { isAuthenticated } from '@/services/authService';
import { Student, Teacher, Trade } from '@/types';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
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

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
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
  }, [studentId, router]);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>

          {teacher && (
            <Link
              href={`/teachers/${teacher.id}`}
              className="inline-flex items-center text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              <UserGroupIcon className="mr-2 h-4 w-4" />
              View Teacher
            </Link>
          )}
        </div>

        <Card gradient gradientFrom="from-indigo-900" gradientVia="via-indigo-600" gradientTo="to-purple-300" padding="lg">
          <div className="flex flex-col gap-6 text-white md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar name={student.name} size="2xl" showStatus statusColor={student.status === 'active' ? 'success' : 'danger'} />
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{student.name}</h1>
                  <StatusBadge status={student.status} className="border-white/40 bg-white/20 text-white" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-indigo-100">
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

            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="rounded-full border border-white/40 px-3 py-1 text-sm text-white/90">
                Teacher: {teacher?.name ?? 'Unassigned'}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-indigo-100">Status</span>
                <Toggle enabled={student.status === 'active'} onChange={handleStatusToggle} />
              </div>
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

        <Card padding="lg">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Strategy</p>
          <p className="mt-1 text-sm text-neutral-700">
            {student.strategy || 'No strategy documented yet.'}
          </p>
        </Card>

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


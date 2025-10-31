'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { StudentCard } from '@/components/teachers/StudentCard';
import { CompactTradeRow } from '@/components/teachers/CompactTradeRow';
import { TradeListHeader } from '@/components/teachers/TradeListHeader';
import { ConfirmDialog } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { storage } from '@/lib/storage';
import { Teacher, Student, Trade } from '@/types';
import { isAuthenticated } from '@/services/authService';

export default function TeacherDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load teacher data
  useEffect(() => {
    const teachers = storage.getItem('teachers') || [];
    const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId);
    
    if (!foundTeacher) {
      router.push('/teachers');
      return;
    }
    
    setTeacher(foundTeacher);

    // Load students for this teacher
    const allStudents = storage.getItem('students') || [];
    const teacherStudents = allStudents.filter((s: Student) => s.teacherId === teacherId);
    setStudents(teacherStudents);

    // Load recent trades for this teacher (limit to 10)
    const allTrades = storage.getItem('trades') || [];
    const teacherTrades = allTrades
      .filter((t: Trade) => t.teacherId === teacherId)
      .sort((a: Trade, b: Trade) => {
        const dateA = new Date(a.timestamp || a.createdAt).getTime();
        const dateB = new Date(b.timestamp || b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);
    setTrades(teacherTrades);
  }, [teacherId, router]);

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
        {/* Back Button and View Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/teachers')}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
            <Link
              href="/teachers"
              className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Back to Teachers
            </Link>
          </div>
          <Link href={`/teachers/${teacherId}/stats`}>
            <Button variant="secondary" size="sm">
              <ChartBarIcon className="h-4 w-4 mr-1" />
              View Statistics
            </Button>
          </Link>
        </div>

        {/* Gradient Header Card */}
        <Card
          gradient
          gradientFrom="from-blue-900"
          gradientVia="via-blue-600"
          gradientTo="to-blue-300"
          padding="sm"
        >
          <div className="flex items-start justify-between">
            {/* Left: Avatar and Info */}
            <div className="flex items-start gap-6">
              <Avatar name={teacher.name} size="2xl" />
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-3">{teacher.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-blue-50">
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
                  <div className="flex items-center gap-2 text-blue-100">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Joined {formatDate(teacher.joinedDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Status and Actions */}
            <div className="flex items-center gap-3">
              <StatusBadge status={teacher.status} />
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="md" hover>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Students</p>
            <p className="text-2xl font-bold text-primary-600">{teacher.totalStudents}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {students.filter(s => s.status === 'active').length} active
            </p>
          </Card>
          
          <Card padding="md" hover>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-success-600">{teacher.totalTrades}</p>
            <p className="text-xs text-neutral-400 mt-1">recent activity</p>
          </Card>
          
          <Card padding="md" hover>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Total Capital</p>
            <p className="text-2xl font-bold text-warning-600">
              ₹{((teacher.totalCapital || 0) / 100000).toFixed(1)}L
            </p>
            <p className="text-xs text-neutral-400 mt-1">under management</p>
          </Card>
          
          <Card padding="md" hover>
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
            <Card>
              <EmptyState
                title="No students yet"
                description="This teacher doesn't have any students assigned"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Card>
              <EmptyState
                title="No trades yet"
                description="This teacher hasn't executed any trades"
              />
            </Card>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <TradeListHeader />
              <div className="divide-y divide-neutral-100">
                {trades.map((trade) => (
                  <CompactTradeRow key={trade.id} trade={trade} />
                ))}
              </div>
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

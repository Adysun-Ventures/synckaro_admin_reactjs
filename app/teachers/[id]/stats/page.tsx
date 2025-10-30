'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/common/Table';
import { EmptyState } from '@/components/common/EmptyState';
import { storage } from '@/lib/storage';
import { Teacher, Student, Trade } from '@/types';
import { isAuthenticated } from '@/services/authService';
import { cn } from '@/lib/utils';

export default function TeacherStatsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load data
  useEffect(() => {
    const teachers = storage.getItem('teachers') || [];
    const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId);
    
    if (!foundTeacher) {
      router.push('/teachers');
      return;
    }
    
    setTeacher(foundTeacher);

    // Load students
    const allStudents = storage.getItem('students') || [];
    const teacherStudents = allStudents.filter((s: Student) => s.teacherId === teacherId);
    setStudents(teacherStudents);

    // Load trades
    const allTrades = storage.getItem('trades') || [];
    const teacherTrades = allTrades.filter((t: Trade) => t.teacherId === teacherId);
    setTrades(teacherTrades);
  }, [teacherId, router]);

  if (!isAuthenticated() || !teacher) {
    return null;
  }

  // Calculate stats
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const losingTrades = trades.filter(t => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const avgTradeValue = totalTrades > 0 
    ? trades.reduce((sum, t) => sum + (t.price * t.quantity), 0) / totalTrades 
    : 0;

  // Most traded stock
  const stockCounts: Record<string, number> = {};
  trades.forEach(t => {
    stockCounts[t.stock] = (stockCounts[t.stock] || 0) + 1;
  });
  const mostTradedStock = Object.entries(stockCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Best and worst performing days
  const dailyPnL: Record<string, number> = {};
  trades.forEach(t => {
    const date = new Date(t.timestamp).toLocaleDateString('en-IN');
    dailyPnL[date] = (dailyPnL[date] || 0) + t.pnl;
  });
  const sortedDays = Object.entries(dailyPnL).sort((a, b) => b[1] - a[1]);
  const bestDay = sortedDays[0] || ['N/A', 0];
  const worstDay = sortedDays[sortedDays.length - 1] || ['N/A', 0];

  // Top students by P&L
  const studentsWithPnL = students.map(s => ({
    ...s,
    pnl: s.currentCapital - s.initialCapital,
    pnlPercentage: ((s.currentCapital - s.initialCapital) / s.initialCapital) * 100,
  })).sort((a, b) => b.pnl - a.pnl).slice(0, 10);

  // Active students count
  const activeStudents = students.filter(s => s.status === 'active').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title={`${teacher.name} - Statistics`}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href={`/teachers/${teacherId}`}
          className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Teacher Details
        </Link>

        {/* Teacher Name */}
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">{teacher.name}</h2>
          <p className="text-neutral-600">Performance Statistics</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">Total Trades</h3>
              <div className="bg-primary-100 p-2 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-neutral-900">{totalTrades}</p>
            <p className="text-sm text-neutral-500 mt-2">
              {winningTrades} wins, {losingTrades} losses
            </p>
          </div>

          <div className={cn(
            'bg-white rounded-xl border border-neutral-200 p-6',
            winRate > 60 ? 'bg-success-50' : winRate < 40 ? 'bg-danger-50' : ''
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">Win Rate</h3>
              <div className="bg-success-100 p-2 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-success-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-neutral-900">{winRate.toFixed(1)}%</p>
            <p className="text-sm text-neutral-500 mt-2">
              {winningTrades} winning trades
            </p>
          </div>

          <div className={cn(
            'bg-white rounded-xl border border-neutral-200 p-6',
            totalPnL > 0 ? 'bg-success-50' : totalPnL < 0 ? 'bg-danger-50' : ''
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">Total P&L</h3>
              <div className={cn(
                'p-2 rounded-lg',
                totalPnL >= 0 ? 'bg-success-100' : 'bg-danger-100'
              )}>
                {totalPnL >= 0 ? (
                  <TrendingUpIcon className="h-5 w-5 text-success-600" />
                ) : (
                  <TrendingDownIcon className="h-5 w-5 text-danger-600" />
                )}
              </div>
            </div>
            <p className={cn(
              'text-3xl font-semibold',
              totalPnL >= 0 ? 'text-success-600' : 'text-danger-600'
            )}>
              {formatCurrency(totalPnL)}
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              Cumulative profit/loss
            </p>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">Active Students</h3>
              <div className="bg-warning-100 p-2 rounded-lg">
                <TrendingUpIcon className="h-5 w-5 text-warning-600" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-neutral-900">{activeStudents}</p>
            <p className="text-sm text-neutral-500 mt-2">
              out of {students.length} total
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Average Trade Value</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(avgTradeValue)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Most Traded Stock</span>
                <span className="font-semibold text-neutral-900">{mostTradedStock}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Specialization</span>
                <span className="font-semibold text-neutral-900">{teacher.specialization}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success-600"></span>
                  <span className="text-sm text-neutral-600">Best Performing Day</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success-600">{formatCurrency(bestDay[1])}</p>
                  <p className="text-xs text-neutral-500">{bestDay[0]}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-danger-600"></span>
                  <span className="text-sm text-neutral-600">Worst Performing Day</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-danger-600">{formatCurrency(worstDay[1])}</p>
                  <p className="text-xs text-neutral-500">{worstDay[0]}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Average P&L per Trade</span>
                <span className={cn(
                  'font-semibold',
                  totalPnL >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {formatCurrency(totalTrades > 0 ? totalPnL / totalTrades : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Top Students by P&L</h3>
          </div>
          {studentsWithPnL.length === 0 ? (
            <EmptyState
              title="No students yet"
              description="This teacher doesn't have any students"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Initial Capital</TableHead>
                  <TableHead className="text-right">Current Capital</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">P&L %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithPnL.map((student, index) => {
                  const rankColors = ['text-warning-600', 'text-neutral-400', 'text-warning-700'];
                  const isTopThree = index < 3;
                  
                  return (
                  <TableRow 
                    key={student.id}
                    className={index === 0 ? 'bg-success-50/30' : ''}
                  >
                    <TableCell className={cn(
                      'font-bold text-lg',
                      isTopThree ? rankColors[index] : 'text-neutral-600 font-medium'
                    )}>
                      {isTopThree ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : `#${index + 1}`}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-900">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-right text-neutral-600">
                      {formatCurrency(student.initialCapital)}
                    </TableCell>
                    <TableCell className="text-right text-neutral-900">
                      {formatCurrency(student.currentCapital)}
                    </TableCell>
                    <TableCell className={cn(
                      'text-right font-medium',
                      student.pnl >= 0 ? 'text-success-600' : 'text-danger-600'
                    )}>
                      {formatCurrency(student.pnl)}
                    </TableCell>
                    <TableCell className={cn(
                      'text-right font-medium',
                      student.pnlPercentage >= 0 ? 'text-success-600' : 'text-danger-600'
                    )}>
                      {student.pnlPercentage.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


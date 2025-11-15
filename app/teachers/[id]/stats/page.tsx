'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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
  const [isReloading, setIsReloading] = useState(false);

  // Check auth
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Load data
  const loadData = useCallback(() => {
    const teachers = storage.getItem('teachers') || [];
    const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId);
    
    if (!foundTeacher) {
      router.push('/teachers');
      return;
    }
    
    setTeacher(foundTeacher);

    // Load students
    const allStudents = storage.getItem('students') || [];
    let teacherStudents = allStudents.filter((s: Student) => s.teacherId === teacherId);
    
    // Hardcoded fallback data if no students found
    if (teacherStudents.length === 0) {
      teacherStudents = [
        {
          id: 'student-1',
          name: 'Rahul Verma',
          email: 'rahul.verma@synckaro.com',
          mobile: '9876543210',
          teacherId: teacherId,
          teacherName: foundTeacher.name,
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
          teacherName: foundTeacher.name,
          status: 'active' as const,
          initialCapital: 90000,
          currentCapital: 105000,
          profitLoss: 15000,
          riskPercentage: 2,
          strategy: 'Conservative',
          joinedDate: new Date('2024-02-10').toISOString(),
        },
        {
          id: 'student-3',
          name: 'Amit Patel',
          email: 'amit.patel@synckaro.com',
          mobile: '9876543212',
          teacherId: teacherId,
          teacherName: foundTeacher.name,
          status: 'active' as const,
          initialCapital: 150000,
          currentCapital: 138000,
          profitLoss: -12000,
          riskPercentage: 4,
          strategy: 'Aggressive',
          joinedDate: new Date('2024-01-20').toISOString(),
        },
      ];
    }
    setStudents(teacherStudents);

    // Load trades
    const allTrades = storage.getItem('trades') || [];
    let teacherTrades = allTrades.filter((t: Trade) => t.teacherId === teacherId);
    
    // Hardcoded fallback data if no trades found
    if (teacherTrades.length === 0) {
      const now = new Date();
      teacherTrades = [
        {
          id: 'trade-1',
          teacherId: teacherId,
          teacherName: foundTeacher.name,
          studentId: teacherStudents[0]?.id,
          studentName: teacherStudents[0]?.name,
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
          teacherId: teacherId,
          teacherName: foundTeacher.name,
          studentId: teacherStudents[1]?.id,
          studentName: teacherStudents[1]?.name,
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
        {
          id: 'trade-3',
          teacherId: teacherId,
          teacherName: foundTeacher.name,
          studentId: teacherStudents[2]?.id,
          studentName: teacherStudents[2]?.name,
          stock: 'RELIANCE',
          quantity: 15,
          price: 2450.0,
          type: 'BUY' as const,
          exchange: 'NSE' as const,
          status: 'executed' as const,
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          pnl: -1800,
        },
        {
          id: 'trade-4',
          teacherId: teacherId,
          teacherName: foundTeacher.name,
          studentId: teacherStudents[0]?.id,
          studentName: teacherStudents[0]?.name,
          stock: 'HDFCBANK',
          quantity: 25,
          price: 1680.0,
          type: 'SELL' as const,
          exchange: 'NSE' as const,
          status: 'executed' as const,
          createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          pnl: 2800,
        },
        {
          id: 'trade-5',
          teacherId: teacherId,
          teacherName: foundTeacher.name,
          studentId: teacherStudents[1]?.id,
          studentName: teacherStudents[1]?.name,
          stock: 'ICICIBANK',
          quantity: 35,
          price: 1120.0,
          type: 'BUY' as const,
          exchange: 'BSE' as const,
          status: 'executed' as const,
          createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          pnl: 2100,
        },
      ];
    }
    setTrades(teacherTrades);
  }, [teacherId, router]);

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

  if (!isAuthenticated() || !teacher) {
    return null;
  }

  // Calculate stats
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => (t.pnl ?? 0) > 0).length;
  const losingTrades = trades.filter(t => (t.pnl ?? 0) < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const avgTradeValue = totalTrades > 0 
    ? trades.reduce((sum, t) => sum + ((t.price ?? 0) * t.quantity), 0) / totalTrades 
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
    const timestamp = t.timestamp ?? t.createdAt;
    if (!timestamp) return;
    const date = new Date(timestamp).toLocaleDateString('en-IN');
    dailyPnL[date] = (dailyPnL[date] || 0) + (t.pnl ?? 0);
  });
  const sortedDays = Object.entries(dailyPnL).sort((a, b) => b[1] - a[1]);
  const bestDay = sortedDays[0] || ['N/A', 0];
  const worstDay = sortedDays[sortedDays.length - 1] || ['N/A', 0];

  // Top students by P&L
  const studentsWithPnL = students
    .map(s => {
      const currentCapital = s.currentCapital ?? 0;
      const initialCapital = s.initialCapital ?? 0;
      const pnl = currentCapital - initialCapital;
      const pnlPercentage = initialCapital > 0 ? ((pnl / initialCapital) * 100) : 0;
      return {
        ...s,
        currentCapital,
        initialCapital,
        pnl,
        pnlPercentage,
      };
    })
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 10);

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
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/teachers/${teacherId}`)}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Teacher Statistics</h2>
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

        {/* Content Container */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          {/* Teacher Name */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-900">{teacher.name}</h2>
            <p className="text-neutral-600">Performance Statistics</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">Total Trades</h3>
              <div className="bg-primary-100 p-2 rounded-lg">
                <ArrowTrendingUpIcon className="h-5 w-5 text-primary-600" />
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
                <ArrowTrendingUpIcon className="h-5 w-5 text-success-600" />
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
                  <ArrowTrendingUpIcon className="h-5 w-5 text-success-600" />
                ) : (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-danger-600" />
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
                <ArrowTrendingUpIcon className="h-5 w-5 text-warning-600" />
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
      </div>
    </DashboardLayout>
  );
}


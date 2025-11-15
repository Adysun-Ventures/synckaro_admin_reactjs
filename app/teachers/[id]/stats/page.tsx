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
import apiClient from '@/lib/api';

export default function TeacherStatsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isReloading, setIsReloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stats from API
  const [performanceStats, setPerformanceStats] = useState<{
    totalTrades: number;
    wins: number;
    losses: number;
    winRate: number;
    totalPnL: number;
    activeStudents: number;
    totalStudents: number;
  } | null>(null);
  
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    averageTradeValue: number;
    mostTradedStock: string;
    specialization: string;
    bestPerformingDay: { pnl: number; date: string };
    worstPerformingDay: { pnl: number; date: string };
    averagePnlPerTrade: number;
  } | null>(null);
  
  const [topStudentsByPnL, setTopStudentsByPnL] = useState<Array<{
    student_id: number;
    rank: number;
    student_name: string;
    initial_capital: number;
    current_capital: number;
    pnl: number;
    pnl_percentage: string;
  }>>([]);

  // Check auth
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
      // Parse teacher_id as number
      const teacherIdNum = parseInt(teacherId, 10);
      if (isNaN(teacherIdNum)) {
        throw new Error('Invalid teacher ID');
      }

      // Fetch teacher stats from API
      const response = await apiClient.post<{
        status: boolean;
        data: {
          teacher: {
            teacher_id: number;
            teacher_name: string;
            performance_statistics: {
              total_trades: {
                count: number;
                wins: number;
                losses: number;
              };
              win_rate: string;
              winning_trades: number;
              total_pnl: number;
              active_students: {
                count: number;
                total: number;
              };
            };
            performance_metrics: {
              average_trade_value: number;
              most_traded_stock: string;
              specialization: string;
              best_performing_day: {
                pnl: number;
                date: string;
              };
              worst_performing_day: {
                pnl: number;
                date: string;
              };
              average_pnl_per_trade: number;
            };
            top_students_by_pnl: Array<{
              student_id: number;
              rank: number;
              student_name: string;
              initial_capital: number;
              current_capital: number;
              pnl: number;
              pnl_percentage: string;
            }>;
          };
        };
      }>('/admin/teacher/stats', {
        teacher_id: teacherIdNum,
      });

      if (response.data && response.data.status && response.data.data) {
        const { teacher: teacherData } = response.data.data;

        // Set teacher info
        const teachers = storage.getItem('teachers') || [];
        const foundTeacher = teachers.find((t: Teacher) => t.id === teacherId) || {
          id: teacherId,
          name: teacherData.teacher_name,
          email: '',
          mobile: '',
          doj: '',
          status: 'active' as const,
          totalStudents: teacherData.performance_statistics.active_students.total,
          totalTrades: teacherData.performance_statistics.total_trades.count,
          specialization: teacherData.performance_metrics.specialization,
          joinedDate: new Date().toISOString(),
        };
        setTeacher(foundTeacher);

        // Set performance statistics
        const stats = teacherData.performance_statistics;
        const winRateNum = parseFloat(stats.win_rate.replace('%', '')) || 0;
        setPerformanceStats({
          totalTrades: stats.total_trades.count,
          wins: stats.total_trades.wins,
          losses: stats.total_trades.losses,
          winRate: winRateNum,
          totalPnL: stats.total_pnl,
          activeStudents: stats.active_students.count,
          totalStudents: stats.active_students.total,
        });

        // Set performance metrics
        setPerformanceMetrics({
          averageTradeValue: teacherData.performance_metrics.average_trade_value,
          mostTradedStock: teacherData.performance_metrics.most_traded_stock,
          specialization: teacherData.performance_metrics.specialization,
          bestPerformingDay: teacherData.performance_metrics.best_performing_day,
          worstPerformingDay: teacherData.performance_metrics.worst_performing_day,
          averagePnlPerTrade: teacherData.performance_metrics.average_pnl_per_trade,
        });

        // Set top students
        setTopStudentsByPnL(teacherData.top_students_by_pnl || []);

        // Convert top students to Student format for compatibility
        const studentsData: Student[] = teacherData.top_students_by_pnl.map((s) => ({
          id: String(s.student_id),
          name: s.student_name,
          email: '',
          mobile: '',
          teacherId: teacherId,
          teacherName: teacherData.teacher_name,
          status: 'active' as const,
          initialCapital: s.initial_capital,
          currentCapital: s.current_capital,
          profitLoss: s.pnl,
          riskPercentage: 0,
          strategy: 'Moderate',
          joinedDate: new Date().toISOString(),
        }));
        setStudents(studentsData);

        // Set empty trades array (API doesn't return trades)
        setTrades([]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching teacher stats:', err);
      setError(err?.error || err?.message || 'Failed to fetch teacher statistics');

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
  }, [teacherId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await loadData();
    } finally {
      setIsReloading(false);
    }
  };

  if (!isAuthenticated() || !teacher) {
    return null;
  }

  // Use stats from API if available, otherwise calculate from local data
  const totalTrades = performanceStats?.totalTrades ?? trades.length;
  const winningTrades = performanceStats?.wins ?? trades.filter(t => (t.pnl ?? 0) > 0).length;
  const losingTrades = performanceStats?.losses ?? trades.filter(t => (t.pnl ?? 0) < 0).length;
  const winRate = performanceStats?.winRate ?? (totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0);
  const totalPnL = performanceStats?.totalPnL ?? trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const avgTradeValue = performanceMetrics?.averageTradeValue ?? (
    totalTrades > 0 
      ? trades.reduce((sum, t) => sum + ((t.price ?? 0) * t.quantity), 0) / totalTrades 
      : 0
  );

  // Most traded stock
  const mostTradedStock = performanceMetrics?.mostTradedStock ?? 'N/A';

  // Best and worst performing days
  const bestDay = performanceMetrics?.bestPerformingDay 
    ? { date: performanceMetrics.bestPerformingDay.date, pnl: performanceMetrics.bestPerformingDay.pnl }
    : { date: 'N/A', pnl: 0 };
  const worstDay = performanceMetrics?.worstPerformingDay
    ? { date: performanceMetrics.worstPerformingDay.date, pnl: performanceMetrics.worstPerformingDay.pnl }
    : { date: 'N/A', pnl: 0 };

  // Top students by P&L - use API data if available
  const studentsWithPnL = topStudentsByPnL.length > 0
    ? topStudentsByPnL.map((s) => ({
        id: String(s.student_id),
        name: s.student_name,
        email: '',
        mobile: '',
        teacherId: teacherId,
        teacherName: teacher?.name || '',
        status: 'active' as const,
        initialCapital: s.initial_capital,
        currentCapital: s.current_capital,
        pnl: s.pnl,
        pnlPercentage: parseFloat(s.pnl_percentage.replace('%', '')) || 0,
      }))
    : students
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
  const activeStudents = performanceStats?.activeStudents ?? students.filter(s => s.status === 'active').length;
  const totalStudents = performanceStats?.totalStudents ?? students.length;

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

        {/* Error Message */}
        {error && (
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p className="text-sm text-neutral-600">Loading statistics...</p>
            </div>
          </div>
        )}

        {/* Content Container */}
        {!loading && (
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
              out of {totalStudents} total
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
                <span className="font-semibold text-neutral-900">
                  {performanceMetrics?.specialization || teacher.specialization || 'N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success-600"></span>
                  <span className="text-sm text-neutral-600">Best Performing Day</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-success-600">{formatCurrency(bestDay.pnl)}</p>
                  <p className="text-xs text-neutral-500">{bestDay.date}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-danger-600"></span>
                  <span className="text-sm text-neutral-600">Worst Performing Day</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-danger-600">{formatCurrency(worstDay.pnl)}</p>
                  <p className="text-xs text-neutral-500">{worstDay.date}</p>
                </div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Average P&L per Trade</span>
                <span className={cn(
                  'font-semibold',
                  (performanceMetrics?.averagePnlPerTrade ?? (totalTrades > 0 ? totalPnL / totalTrades : 0)) >= 0 
                    ? 'text-success-600' 
                    : 'text-danger-600'
                )}>
                  {formatCurrency(performanceMetrics?.averagePnlPerTrade ?? (totalTrades > 0 ? totalPnL / totalTrades : 0))}
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
        )}
      </div>
    </DashboardLayout>
  );
}


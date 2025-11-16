'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeftIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/common/Table';
import { EmptyState } from '@/components/common/EmptyState';
import { storage } from '@/lib/storage';
import { Student, Trade } from '@/types';
import { isAuthenticated } from '@/services/authService';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api';
import { Card } from '@/components/common/Card';

export default function StudentStatsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

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
      const studentIdNum = parseInt(studentId, 10);
      if (isNaN(studentIdNum)) {
        throw new Error('Invalid student ID');
      }

      const response = await apiClient.post<{
        status: boolean;
        data: {
          student: {
            student_id: number;
            student_name: string;
            performance_statistics: {
              total_trades: {
                count: number;
                wins: number;
                losses: number;
              };
              win_rate: string;
              winning_trades: number;
              total_pnl: number;
              active_teachers: {
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
            teacher_performance_comparison: Array<{
              teacher_id: number | null;
              teacher_name: string;
              teacher_rank_for_student: number;
              student_pnl_under_teacher: number;
              student_win_rate_under_teacher: string;
            }>;
            recent_trade_history: Array<{
              date: string;
              stock: string;
              trade_type: string;
              quantity: number;
              buy_price: number;
              sell_price: number;
              pnl: number;
            }>;
          };
        };
      }>('/admin/student/stats', {
        student_id: studentIdNum,
      });

      if (response.data && response.data.status && response.data.data) {
        const apiData = response.data.data.student;

        // Map student data
        const mappedStudent: Student = {
          id: String(apiData.student_id),
          name: apiData.student_name,
          email: '',
          mobile: '',
          teacherId: '',
          status: 'active',
          initialCapital: 0,
          currentCapital: 0,
          joinedDate: new Date().toISOString(),
        };
        setStudent(mappedStudent);

        // Store stats
        setStats(apiData);

        // Map recent trades
        const mappedTrades: Trade[] = apiData.recent_trade_history.map((trade, index) => ({
          id: `trade-${apiData.student_id}-${index}`,
          teacherId: '',
          studentId: String(apiData.student_id),
          studentName: apiData.student_name,
          stock: trade.stock,
          quantity: trade.quantity,
          price: trade.buy_price || trade.sell_price,
          type: trade.trade_type as 'BUY' | 'SELL',
          exchange: 'NSE' as 'NSE' | 'BSE',
          status: 'executed' as const,
          createdAt: trade.date,
          timestamp: trade.date,
          pnl: trade.pnl,
        }));

        setTrades(mappedTrades);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching student stats:', err);
      setError(err?.error || err?.message || 'Failed to fetch student statistics');
    } finally {
      setLoading(false);
    }
  }, [studentId, router]);

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

  if (!isAuthenticated()) {
    return null;
  }

  // Get stats from API data
  const performanceStats = stats?.performance_statistics;
  const performanceMetrics = stats?.performance_metrics;

  // Use API data or fallback to calculated values
  const totalTrades = performanceStats?.total_trades?.count || trades.length;
  const winningTrades = performanceStats?.total_trades?.wins || trades.filter(t => (t.pnl ?? 0) > 0).length;
  const losingTrades = performanceStats?.total_trades?.losses || trades.filter(t => (t.pnl ?? 0) < 0).length;
  const winRate = performanceStats?.win_rate 
    ? parseFloat(performanceStats.win_rate.replace('%', '')) 
    : (totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0);
  const totalPnL = performanceStats?.total_pnl || trades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const avgTradeValue = performanceMetrics?.average_trade_value || 0;
  const mostTradedStock = performanceMetrics?.most_traded_stock || 'N/A';
  const specialization = performanceMetrics?.specialization || 'N/A';
  const bestDay = performanceMetrics?.best_performing_day 
    ? [performanceMetrics.best_performing_day.date, performanceMetrics.best_performing_day.pnl]
    : ['N/A', 0];
  const worstDay = performanceMetrics?.worst_performing_day
    ? [performanceMetrics.worst_performing_day.date, performanceMetrics.worst_performing_day.pnl]
    : ['N/A', 0];
  const avgPnlPerTrade = performanceMetrics?.average_pnl_per_trade || 0;

  // Capital metrics - these might not be in the stats API, keep calculated for now
  const initialCapital = student?.initialCapital || 0;
  const currentCapital = student?.currentCapital || 0;
  const capitalPnL = currentCapital - initialCapital;
  const capitalPnLPercentage = initialCapital > 0 ? ((capitalPnL / initialCapital) * 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout title={student ? `${student.name} - Statistics` : 'Student Statistics'}>
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/students/${studentId}`)}
              className="inline-flex h-9 items-center gap-2 rounded-3xl border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>

          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">Student Statistics</h2>
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
          <Card padding="lg">
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
              <p className="text-sm text-danger-600">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card padding="lg">
            <div className="flex flex-col items-center justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 animate-spin mb-4" />
              <p className="text-sm text-neutral-600">Loading student statistics...</p>
            </div>
          </Card>
        )}

        {/* Content Container */}
        {!loading && student && stats && (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          {/* Student Name */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-900">{stats.student_name || student.name}</h2>
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
                  <ArrowTrendingDownIcon className="h-5 w-5 text-danger-600" />
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

          <div className={cn(
            'bg-white rounded-xl border border-neutral-200 p-6',
            capitalPnL > 0 ? 'bg-success-50' : capitalPnL < 0 ? 'bg-danger-50' : ''
          )}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-600">Capital P&L</h3>
              <div className={cn(
                'p-2 rounded-lg',
                capitalPnL >= 0 ? 'bg-success-100' : 'bg-danger-100'
              )}>
                {capitalPnL >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-success-600" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-danger-600" />
                )}
              </div>
            </div>
            <p className={cn(
              'text-3xl font-semibold',
              capitalPnL >= 0 ? 'text-success-600' : 'text-danger-600'
            )}>
              {formatCurrency(capitalPnL)}
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              {capitalPnLPercentage.toFixed(2)}% return
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Initial Capital</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(initialCapital)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Current Capital</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(currentCapital)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Risk Percentage</span>
                <span className="font-semibold text-neutral-900">{student.riskPercentage || 0}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Average Trade Value</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(avgTradeValue)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Most Traded Stock</span>
                <span className="font-semibold text-neutral-900">{mostTradedStock}</span>
              </div>
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
                  avgPnlPerTrade >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {formatCurrency(avgPnlPerTrade)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-600">Specialization</span>
                <span className="font-semibold text-neutral-900">{specialization}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Trades</h3>
          </div>
          {trades.length === 0 ? (
            <EmptyState
              title="No trades yet"
              description="This student hasn't executed any trades"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => {
                  // API returns date in "DD/MM/YYYY" format, try to parse it
                  const tradeDate = trade.timestamp || trade.createdAt;
                  let displayDate = 'N/A';
                  if (tradeDate) {
                    try {
                      // Try parsing DD/MM/YYYY format
                      if (tradeDate.includes('/')) {
                        displayDate = tradeDate;
                      } else {
                        displayDate = new Date(tradeDate).toLocaleDateString('en-IN');
                      }
                    } catch {
                      displayDate = tradeDate;
                    }
                  }
                  return (
                  <TableRow key={trade.id}>
                    <TableCell className="text-neutral-600">
                      {displayDate}
                    </TableCell>
                    <TableCell className="font-medium text-neutral-900">
                      {trade.stock}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        trade.type === 'BUY' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'
                      )}>
                        {trade.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-neutral-600">
                      {trade.quantity}
                    </TableCell>
                    <TableCell className="text-right text-neutral-900">
                      {formatCurrency(trade.price || 0)}
                    </TableCell>
                    <TableCell className={cn(
                      'text-right font-medium',
                      (trade.pnl ?? 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                    )}>
                      {formatCurrency(trade.pnl ?? 0)}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        trade.status === 'executed' ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                      )}>
                        {trade.status}
                      </span>
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


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

export default function StudentStatsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
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
    const students = storage.getItem('students') || [];
    const foundStudent = students.find((s: Student) => s.id === studentId);
    
    if (!foundStudent) {
      router.push('/students');
      return;
    }
    
    setStudent(foundStudent);

    // Load trades
    const allTrades = storage.getItem('trades') || [];
    let studentTrades = allTrades.filter((t: Trade) => t.studentId === studentId);
    
    // TODO: Remove hardcoded fallback - Replace with actual API response when backend provides trades data
    // Hardcoded fallback data if no trades found
    if (studentTrades.length === 0) {
      const now = new Date();
      studentTrades = [
        {
          id: 'trade-1',
          teacherId: foundStudent.teacherId || '',
          teacherName: foundStudent.teacherName,
          studentId: studentId,
          studentName: foundStudent.name,
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
          teacherId: foundStudent.teacherId || '',
          teacherName: foundStudent.teacherName,
          studentId: studentId,
          studentName: foundStudent.name,
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
          teacherId: foundStudent.teacherId || '',
          teacherName: foundStudent.teacherName,
          studentId: studentId,
          studentName: foundStudent.name,
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
          teacherId: foundStudent.teacherId || '',
          teacherName: foundStudent.teacherName,
          studentId: studentId,
          studentName: foundStudent.name,
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
          teacherId: foundStudent.teacherId || '',
          teacherName: foundStudent.teacherName,
          studentId: studentId,
          studentName: foundStudent.name,
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
    setTrades(studentTrades);
  }, [studentId, router]);

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

  if (!isAuthenticated() || !student) {
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

  // Capital metrics
  const initialCapital = student.initialCapital || 0;
  const currentCapital = student.currentCapital || 0;
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
    <DashboardLayout title={`${student.name} - Statistics`}>
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

        {/* Content Container */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-6">
          {/* Student Name */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-neutral-900">{student.name}</h2>
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
                  totalPnL >= 0 ? 'text-success-600' : 'text-danger-600'
                )}>
                  {formatCurrency(totalTrades > 0 ? totalPnL / totalTrades : 0)}
                </span>
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
                {trades.slice(0, 10).map((trade) => {
                  const tradeDate = trade.timestamp || trade.createdAt;
                  return (
                  <TableRow key={trade.id}>
                    <TableCell className="text-neutral-600">
                      {tradeDate ? new Date(tradeDate).toLocaleDateString('en-IN') : 'N/A'}
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
      </div>
    </DashboardLayout>
  );
}


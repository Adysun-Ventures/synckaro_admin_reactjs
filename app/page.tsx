'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api';
import { cn } from '@/lib/utils';

// Define types for dashboard data
type StatItem = {
  name: string;
  value: string;
  change: number;
  icon: typeof AcademicCapIcon;
  bgColor: string;
  iconColor: string;
};

type ReportHighlight = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

type ReportBreakdownItem = {
  segment: string;
  trades: number;
  winRate: string;
  pnl: string;
  positive: boolean;
};

type InsightCard = {
  title: string;
  description: string;
  value: string;
  meta: string;
  tone: 'success' | 'warning' | 'neutral';
  icon: typeof TrophyIcon;
};

type DashboardData = {
  stats: StatItem[];
  reportHighlights: ReportHighlight[];
  reportBreakdown: ReportBreakdownItem[];
  insightCards: InsightCard[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, userId, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Format percentage change
  const formatPercentageChange = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Format number with commas
  const formatNumber = (value: number): string => {
    return value.toLocaleString('en-IN');
  };

  // Determine if P&L is positive
  const isPositivePnl = (pnl: string): boolean => {
    return pnl.startsWith('+') || (!pnl.startsWith('-') && parseFloat(pnl.replace(/[₹,]/g, '')) > 0);
  };

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    if (!userId || !isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        status: boolean;
        data: {
          summary: {
            total_teachers: { count: number; change_percentage: number };
            total_students: { count: number; change_percentage: number };
            total_trades: { count: number; change_percentage: number };
            active_users: { count: number; change_percentage: number };
          };
          reports_overview: {
            daily_volume: { amount: string; change_percentage: number };
            net_pnl_7d: { amount: string; change_percentage: number };
            risk_exposure: { amount: string; change_percentage: number };
            orders_pending: number;
          };
          strategy_desk: Array<{
            strategy: string;
            trades: number;
            win_rate: string;
            net_pnl: string;
          }>;
          trading_insights: {
            top_performer_24h: { name: string; net_pnl: string; win_rate: string };
            open_alerts: { total: number; details: string; last_raised: string };
            net_pnl_today: { amount: string; trades: number; change_vs_yesterday: number };
          };
          last_updated: string;
        };
      }>('/admin/home', {
        user_id: userId,
      });

      if (response.data && response.data.status && response.data.data) {
        const apiData = response.data.data;

        // Map summary to stats
        const mappedStats = [
          {
            name: 'Total Teachers',
            value: formatNumber(apiData.summary.total_teachers.count),
            change: Math.round(apiData.summary.total_teachers.change_percentage),
            icon: AcademicCapIcon,
            bgColor: 'bg-primary-100',
            iconColor: 'text-primary-600',
          },
          {
            name: 'Total Students',
            value: formatNumber(apiData.summary.total_students.count),
            change: Math.round(apiData.summary.total_students.change_percentage),
            icon: UserGroupIcon,
            bgColor: 'bg-success-100',
            iconColor: 'text-success-600',
          },
          {
            name: 'Total Trades',
            value: formatNumber(apiData.summary.total_trades.count),
            change: Math.round(apiData.summary.total_trades.change_percentage),
            icon: ChartBarIcon,
            bgColor: 'bg-warning-100',
            iconColor: 'text-warning-600',
          },
          {
            name: 'Active Users',
            value: formatNumber(apiData.summary.active_users.count),
            change: Math.round(apiData.summary.active_users.change_percentage),
            icon: BoltIcon,
            bgColor: 'bg-danger-100',
            iconColor: 'text-danger-600',
          },
        ];

        // Map reports_overview to reportHighlights
        const mappedReportHighlights = [
          {
            label: 'Daily Volume',
            value: apiData.reports_overview.daily_volume.amount,
            delta: formatPercentageChange(apiData.reports_overview.daily_volume.change_percentage),
            positive: apiData.reports_overview.daily_volume.change_percentage >= 0,
          },
          {
            label: 'Net P&L (7d)',
            value: apiData.reports_overview.net_pnl_7d.amount,
            delta: formatPercentageChange(apiData.reports_overview.net_pnl_7d.change_percentage),
            positive: apiData.reports_overview.net_pnl_7d.change_percentage >= 0,
          },
          {
            label: 'Risk Exposure',
            value: apiData.reports_overview.risk_exposure.amount,
            delta: formatPercentageChange(apiData.reports_overview.risk_exposure.change_percentage),
            positive: apiData.reports_overview.risk_exposure.change_percentage >= 0,
          },
          {
            label: 'Orders Pending',
            value: String(apiData.reports_overview.orders_pending),
            delta: '+0', // Default since API doesn't provide change
            positive: false,
          },
        ];

        // Map strategy_desk to reportBreakdown
        const mappedReportBreakdown = apiData.strategy_desk.map((item) => ({
          segment: item.strategy,
          trades: item.trades,
          winRate: item.win_rate,
          pnl: item.net_pnl,
          positive: isPositivePnl(item.net_pnl),
        }));

        // Map trading_insights to insightCards
        const mappedInsightCards = [
          {
            title: 'Top Performer (24h)',
            description: apiData.trading_insights.top_performer_24h.name,
            value: apiData.trading_insights.top_performer_24h.net_pnl,
            meta: `Win rate ${apiData.trading_insights.top_performer_24h.win_rate}`,
            tone: 'success' as const,
            icon: TrophyIcon,
          },
          {
            title: 'Open Alerts',
            description: `${apiData.trading_insights.open_alerts.total} active alerts`,
            value: apiData.trading_insights.open_alerts.details,
            meta: `Last raised ${apiData.trading_insights.open_alerts.last_raised}`,
            tone: 'warning' as const,
            icon: ShieldExclamationIcon,
          },
          {
            title: 'Net P&L (Today)',
            description: `Across ${apiData.trading_insights.net_pnl_today.trades} trades`,
            value: apiData.trading_insights.net_pnl_today.amount,
            meta: `vs yesterday ${formatPercentageChange(apiData.trading_insights.net_pnl_today.change_vs_yesterday)}`,
            tone: 'success' as const,
            icon: BanknotesIcon,
          },
        ];

        setDashboardData({
          stats: mappedStats,
          reportHighlights: mappedReportHighlights,
          reportBreakdown: mappedReportBreakdown,
          insightCards: mappedInsightCards,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err?.error || err?.message || 'Failed to fetch dashboard data');
      // Fallback to default data on error
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (userId && isAuthenticated) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, userId, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const formatCurrency = (value: number, fractionDigits = 2) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  };

  // Default/fallback stats (from seed data)
  const defaultStats: StatItem[] = [
    {
      name: 'Total Teachers',
      value: '24',
      change: 12,
      icon: AcademicCapIcon,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      name: 'Total Students',
      value: '542',
      change: 8,
      icon: UserGroupIcon,
      bgColor: 'bg-success-100',
      iconColor: 'text-success-600',
    },
    {
      name: 'Total Trades',
      value: '1,247',
      change: -3,
      icon: ChartBarIcon,
      bgColor: 'bg-warning-100',
      iconColor: 'text-warning-600',
    },
    {
      name: 'Active Users',
      value: '489',
      change: 5,
      icon: BoltIcon,
      bgColor: 'bg-danger-100',
      iconColor: 'text-danger-600',
    },
  ];

  const stats: StatItem[] = dashboardData?.stats || defaultStats;

  const recentActivities = [
    {
      teacher: 'John Doe',
      action: 'Executed market order',
      symbol: 'SBIN',
      exchange: 'NSE',
      side: 'BUY',
      quantity: 120,
      avgPrice: 612.35,
      pnl: 15240,
      time: '2m ago',
    },
    {
      teacher: 'Priya Sharma',
      action: 'Booked partial profit',
      symbol: 'RELIANCE',
      exchange: 'BSE',
      side: 'SELL',
      quantity: 80,
      avgPrice: 2345.5,
      pnl: 9450,
      time: '12m ago',
    },
    {
      teacher: 'Rahul Verma',
      action: 'Exited stop-loss',
      symbol: 'HDFCBANK',
      exchange: 'NSE',
      side: 'SELL',
      quantity: 65,
      avgPrice: 1542.8,
      pnl: -3820,
      time: '35m ago',
    },
  ];

  // Default/fallback insight cards (from seed data)
  const defaultInsightCards: InsightCard[] = [
    {
      title: 'Top Performer (24h)',
      description: 'Priya Sharma',
      value: '+₹23,450',
      meta: 'Win rate 78%',
      tone: 'success' as const,
      icon: TrophyIcon,
    },
    {
      title: 'Open Alerts',
      description: '3 active alerts',
      value: '2 risk, 1 review',
      meta: 'Last raised 12m ago',
      tone: 'warning' as const,
      icon: ShieldExclamationIcon,
    },
    {
      title: 'Net P&L (Today)',
      description: 'Across 212 trades',
      value: '+₹42,180',
      meta: 'vs yesterday +6.4%',
      tone: 'success' as const,
      icon: BanknotesIcon,
    },
  ];

  const insightCards: InsightCard[] = dashboardData?.insightCards || defaultInsightCards;

  // Default/fallback report highlights (from seed data)
  const defaultReportHighlights: ReportHighlight[] = [
    {
      label: 'Daily Volume',
      value: '₹12.4Cr',
      delta: '+4.3%',
      positive: true,
    },
    {
      label: 'Net P&L (7d)',
      value: '+₹2.1Cr',
      delta: '+1.8%',
      positive: true,
    },
    {
      label: 'Risk Exposure',
      value: '₹38.6L',
      delta: '-2.1%',
      positive: true,
    },
    {
      label: 'Orders Pending',
      value: '18',
      delta: '+6',
      positive: false,
    },
  ];

  const reportHighlights: ReportHighlight[] = dashboardData?.reportHighlights || defaultReportHighlights;

  // Default/fallback report breakdown (from seed data)
  const defaultReportBreakdown: ReportBreakdownItem[] = [
    {
      segment: 'Breakout Setups',
      trades: 42,
      winRate: '64%',
      pnl: '+₹12,830',
      positive: true,
    },
    {
      segment: 'Intraday Momentum',
      trades: 35,
      winRate: '58%',
      pnl: '+₹8,410',
      positive: true,
    },
    {
      segment: 'Swing Reversal',
      trades: 18,
      winRate: '41%',
      pnl: '-₹2,640',
      positive: false,
    },
    {
      segment: 'Options Hedging',
      trades: 27,
      winRate: '52%',
      pnl: '+₹4,120',
      positive: true,
    },
  ];

  const reportBreakdown: ReportBreakdownItem[] = dashboardData?.reportBreakdown || defaultReportBreakdown;

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Card */}
      <div className="bg-primary-600 rounded-xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-semibold mb-2">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h2>
        <p className="text-primary-100">
          Here's what's happening with your platform today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat: StatItem) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              {/* Percentage Change Indicator */}
              <div className={cn(
                'flex items-center gap-1 text-xs font-semibold',
                stat.change >= 0 ? 'text-success-600' : 'text-danger-600'
              )}>
                {stat.change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                )}
                <span>{Math.abs(stat.change)}%</span>
              </div>
            </div>
            <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">{stat.name}</p>
            <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <Card
          padding="lg"
          tone="neutral"
          hover
          header={
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Reports Overview</h3>
              <p className="text-xs font-medium text-neutral-500">Updated 5 minutes ago</p>
            </div>
          }
          footer={<span className="text-xs text-neutral-400">Synthetic data for demonstration purposes.</span>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {reportHighlights.map((item: ReportHighlight) => (
              <div
                key={item.label}
                className="rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{item.label}</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-2xl font-semibold text-neutral-900">{item.value}</p>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      item.positive ? 'text-success-600' : 'text-danger-600'
                    )}
                  >
                    {item.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white/90">
            <div className="grid grid-cols-[1.5fr_repeat(3,1fr)] gap-3 border-b border-neutral-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <span>Strategy / Desk</span>
              <span className="text-right">Trades</span>
              <span className="text-right">Win Rate</span>
              <span className="text-right">Net P&L</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {reportBreakdown.map((row: ReportBreakdownItem) => (
                <div key={row.segment} className="grid grid-cols-[1.5fr_repeat(3,1fr)] items-center gap-3 px-4 py-3 text-sm">
                  <span className="font-medium text-neutral-800">{row.segment}</span>
                  <span className="justify-self-end text-neutral-700">{row.trades}</span>
                  <span className="justify-self-end text-neutral-700">{row.winRate}</span>
                  <span
                    className={cn(
                      'justify-self-end font-semibold',
                      row.positive ? 'text-success-600' : 'text-danger-600'
                    )}
                  >
                    {row.pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          padding="lg"
          tone="neutral"
          hover
          header={<h3 className="text-lg font-semibold text-neutral-900">Trading Insights</h3>}
        >
          <div className="flex flex-col gap-3">
            {insightCards.map((card: InsightCard) => {
              const toneStyles: Record<'success' | 'warning' | 'neutral', { iconBg: string; valueColor: string }> = {
                success: {
                  iconBg: 'bg-success-50 text-success-700 border-success-200',
                  valueColor: 'text-success-600',
                },
                warning: {
                  iconBg: 'bg-warning-50 text-warning-700 border-warning-200',
                  valueColor: 'text-warning-700',
                },
                neutral: {
                  iconBg: 'bg-neutral-50 text-neutral-600 border-neutral-200',
                  valueColor: 'text-neutral-900',
                },
              } as const;

              const tone = toneStyles[card.tone] || toneStyles.neutral;

              return (
                <div
                  key={card.title}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/70 px-3.5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', tone.iconBg)}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                        {card.title}
                      </p>
                      <p className="text-sm font-semibold text-neutral-900">{card.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-semibold', tone.valueColor)}>{card.value}</p>
                    <p className="text-[11px] text-neutral-400">{card.meta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

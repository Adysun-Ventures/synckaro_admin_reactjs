'use client';

import { useEffect } from 'react';
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
import { isAuthenticated, getCurrentUser } from '@/services/authService';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
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

  const stats = [
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

  const insightCards = [
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
        {stats.map((stat) => (
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

      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
       

        {/* Trading Insights */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Trading Insights
          </h3>
          <div className="flex flex-col gap-3">
            {insightCards.map((card) => {
              const toneStyles = {
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
        </div>
      </div>
    </DashboardLayout>
  );
}

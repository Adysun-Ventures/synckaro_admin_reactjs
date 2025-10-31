'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  PresentationChartLineIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { isAuthenticated } from '@/services/authService';
import { cn } from '@/lib/utils';

const summaryMetrics = [
  {
    label: 'Gross Volume (MTD)',
    value: '₹ 64.8Cr',
    delta: '+6.3%',
    positive: true,
    icon: BanknotesIcon,
  },
  {
    label: 'Net Realized P&L',
    value: '+₹ 4.7Cr',
    delta: '+2.8%',
    positive: true,
    icon: PresentationChartLineIcon,
  },
  {
    label: 'Win Rate',
    value: '61.4%',
    delta: '-1.7%',
    positive: false,
    icon: ArrowTrendingUpIcon,
  },
  {
    label: 'Risk Score',
    value: 'Moderate (42)',
    delta: '-4 pts',
    positive: true,
    icon: ShieldCheckIcon,
  },
];

const strategyPerformance = [
  {
    segment: 'Breakout Momentum',
    trades: 128,
    pnl: '+₹ 18.4L',
    hitRate: '67%',
    avgHolding: '38m',
    positive: true,
  },
  {
    segment: 'Options Hedging',
    trades: 86,
    pnl: '+₹ 9.2L',
    hitRate: '58%',
    avgHolding: '4h 12m',
    positive: true,
  },
  {
    segment: 'Swing Reversal',
    trades: 52,
    pnl: '-₹ 3.6L',
    hitRate: '43%',
    avgHolding: '1d 7h',
    positive: false,
  },
  {
    segment: 'Index Arbitrage',
    trades: 34,
    pnl: '+₹ 4.1L',
    hitRate: '72%',
    avgHolding: '22m',
    positive: true,
  },
];

const riskAlerts = [
  {
    title: 'High leverage usage',
    detail: '3 desks above 4.5x intraday exposure',
    severity: 'warning' as const,
    owner: 'Desk Ops',
    updated: '12 mins ago',
  },
  {
    title: 'Drawdown threshold nearing',
    detail: 'Options Hedging desk at -7.8% (limit -10%)',
    severity: 'critical' as const,
    owner: 'Risk Control',
    updated: '35 mins ago',
  },
  {
    title: 'Capital idle > 48h',
    detail: '₹2.3Cr parked in cash accounts without deployment',
    severity: 'info' as const,
    owner: 'Treasury',
    updated: '1h ago',
  },
];

const equitySeries = [98, 105, 112, 116, 123, 119, 126, 134, 139, 147, 153, 160];

const deskContribution = [
  { desk: 'Momentum', weight: 32, tone: 'bg-success-500/70' },
  { desk: 'Arbitrage', weight: 24, tone: 'bg-primary-500/70' },
  { desk: 'Options', weight: 18, tone: 'bg-warning-500/70' },
  { desk: 'Swing', weight: 14, tone: 'bg-indigo-500/70' },
  { desk: 'Discretionary', weight: 12, tone: 'bg-neutral-500/70' },
];

const orderFlow = [
  { label: 'Cash Equity', buys: 62, sells: 38 },
  { label: 'Index Futures', buys: 54, sells: 46 },
  { label: 'Options', buys: 47, sells: 53 },
  { label: 'Currency', buys: 41, sells: 59 },
];

const profitDistribution = [
  { label: 'Alpha Desks', value: '₹ 2.6Cr', delta: '+7.6%' },
  { label: 'Market Making', value: '₹ 1.3Cr', delta: '+3.1%' },
  { label: 'Advisory', value: '₹ 0.8Cr', delta: '-1.4%' },
];

const sparklineGradientId = 'reports-sparkline-gradient';

function Sparkline({ data, color = '#16a34a' }: { data: number[]; color?: string }) {
  const width = 220;
  const height = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(max - min, 1);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full">
      <defs>
        <linearGradient id={sparklineGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="url(#reports-sparkline-gradient)"
        stroke="none"
        strokeWidth="0"
        points={areaPoints}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function DeskBar({ weight, tone }: { weight: number; tone: string }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200/70">
      <div className={cn('absolute inset-y-0 rounded-full', tone)} style={{ width: `${weight}%` }} />
    </div>
  );
}

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <Card
          padding="lg"
          tone="neutral"
          hover
          header={
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-neutral-900">Executive Summary</h2>
              <span className="text-xs font-medium text-neutral-500">MTD snapshot • Refreshed 5 minutes ago</span>
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryMetrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-start justify-between rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900">{metric.value}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      metric.positive ? 'text-success-600' : 'text-danger-600'
                    )}
                  >
                    {metric.delta}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50">
                    <metric.icon className="h-4 w-4 text-neutral-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Card
              padding="lg"
              tone="neutral"
              className="bg-white/90"
              header={<h3 className="text-sm font-semibold text-neutral-800">Equity Curve (MTD)</h3>}
            >
              <Sparkline data={equitySeries} color="#2563eb" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <span>Start ₹48.2Cr</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-500" />
                  <span>Current ₹64.8Cr</span>
                </div>
              </div>
            </Card>

            <Card
              padding="lg"
              tone="neutral"
              className="bg-white/90"
              header={<h3 className="text-sm font-semibold text-neutral-800">Desk Contribution</h3>}
            >
              <div className="space-y-3">
                {deskContribution.map((desk) => (
                  <div key={desk.desk} className="flex items-center gap-3 text-sm">
                    <span className="w-32 text-neutral-700">{desk.desk}</span>
                    <DeskBar weight={desk.weight} tone={desk.tone} />
                    <span className="w-10 text-right text-neutral-500">{desk.weight}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Card>

        <Card
          padding="lg"
          tone="neutral"
          hover
          header={<h3 className="text-lg font-semibold text-neutral-900">Strategy Performance</h3>}
          footer={<span className="text-xs text-neutral-400">Metrics evaluated across all desks this month.</span>}
        >
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/90">
            <div className="grid grid-cols-[1.5fr_repeat(4,1fr)] gap-3 border-b border-neutral-200 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              <span>Strategy</span>
              <span className="text-right">Trades</span>
              <span className="text-right">Hit Rate</span>
              <span className="text-right">Avg Holding</span>
              <span className="text-right">Net P&L</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {strategyPerformance.map((row) => (
                <div key={row.segment} className="grid grid-cols-[1.5fr_repeat(4,1fr)] items-center gap-3 px-4 py-3 text-sm">
                  <span className="font-medium text-neutral-800">{row.segment}</span>
                  <span className="justify-self-end text-neutral-700">{row.trades}</span>
                  <span className="justify-self-end text-neutral-700">{row.hitRate}</span>
                  <span className="justify-self-end text-neutral-700">{row.avgHolding}</span>
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
          header={<h3 className="text-lg font-semibold text-neutral-900">Risk & Compliance</h3>}
        >
          <div className="flex flex-col gap-3">
            {riskAlerts.map((alert) => {
              const badgeStyles = {
                info: 'text-neutral-600 bg-neutral-100 border-neutral-200',
                warning: 'text-warning-700 bg-warning-50 border-warning-200',
                critical: 'text-danger-700 bg-danger-50 border-danger-200',
              } as const;

              const iconMap = {
                info: AdjustmentsHorizontalIcon,
                warning: ArrowTrendingUpIcon,
                critical: FireIcon,
              };

              const Icon = iconMap[alert.severity];

              return (
                <div
                  key={alert.title}
                  className="flex items-start justify-between rounded-xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900">{alert.title}</span>
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium', badgeStyles[alert.severity])}>
                        <Icon className="h-3.5 w-3.5" />
                        {alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Warning' : 'Info'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600">{alert.detail}</p>
                  </div>
                  <div className="text-right text-xs text-neutral-400">
                    <p>{alert.owner}</p>
                    <p>{alert.updated}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
          <Card
            padding="lg"
            tone="neutral"
            hover
            header={<h3 className="text-sm font-semibold text-neutral-800">Order Flow Mix</h3>}
          >
            <div className="space-y-3">
              {orderFlow.map((row) => {
                const total = row.buys + row.sells;
                const buyWidth = Math.round((row.buys / total) * 100);
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{row.label}</span>
                      <span>
                        Buys {row.buys}% · Sells {row.sells}%
                      </span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full">
                      <div className="bg-success-500/80" style={{ width: `${buyWidth}%` }} />
                      <div className="bg-danger-500/70 flex-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            padding="lg"
            tone="neutral"
            hover
            header={<h3 className="text-sm font-semibold text-neutral-800">Exposure Heatmap</h3>}
          >
            <div className="grid grid-cols-3 gap-3">
              {['Banks', 'IT', 'Pharma', 'Energy', 'Auto', 'Metals'].map((sector, index) => (
                <div
                  key={sector}
                  className={cn(
                    'rounded-xl border border-neutral-200 px-3 py-4 text-center shadow-sm transition-colors',
                    index % 2 === 0 ? 'bg-success-50/70 text-success-700' : 'bg-danger-50/70 text-danger-700'
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500/90">{sector}</p>
                  <p className="mt-1 text-lg font-semibold">{index % 2 === 0 ? `+${(Math.random() * 4 + 2).toFixed(1)}%` : `-${(Math.random() * 3 + 1).toFixed(1)}%`}</p>
                  <p className="text-[11px] text-neutral-500/80">vs prev. week</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            padding="lg"
            tone="neutral"
            hover
            header={<h3 className="text-sm font-semibold text-neutral-800">Profit Distribution</h3>}
          >
            <div className="space-y-3">
              {profitDistribution.map((line, idx) => (
                <div key={line.label} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 shadow-sm">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{line.label}</p>
                    <p className="text-sm font-semibold text-neutral-900">{line.value}</p>
                  </div>
                  <span className={cn('text-xs font-semibold', idx === 2 ? 'text-danger-600' : 'text-success-600')}>
                    {line.delta}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


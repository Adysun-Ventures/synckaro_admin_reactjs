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

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
    icon: ScaleIcon,
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

const equityChartData = [
  { date: 'Oct 1', nav: 48.2 },
  { date: 'Oct 3', nav: 51.4 },
  { date: 'Oct 5', nav: 54.1 },
  { date: 'Oct 7', nav: 56.8 },
  { date: 'Oct 9', nav: 59.3 },
  { date: 'Oct 11', nav: 57.9 },
  { date: 'Oct 13', nav: 60.3 },
  { date: 'Oct 15', nav: 62.7 },
  { date: 'Oct 17', nav: 63.9 },
  { date: 'Oct 19', nav: 65.4 },
  { date: 'Oct 21', nav: 66.8 },
  { date: 'Oct 23', nav: 67.9 },
];

const deskContribution = [
  { desk: 'Momentum', weight: 32, color: '#16a34a' },
  { desk: 'Arbitrage', weight: 24, color: '#2563eb' },
  { desk: 'Options', weight: 18, color: '#f59e0b' },
  { desk: 'Swing', weight: 14, color: '#6366f1' },
  { desk: 'Discretionary', weight: 12, color: '#64748b' },
];

const orderFlowSeries = [
  { label: 'Cash Equity', Buys: 62, Sells: 38 },
  { label: 'Index Futures', Buys: 54, Sells: 46 },
  { label: 'Options', Buys: 47, Sells: 53 },
  { label: 'Currency', Buys: 41, Sells: 59 },
];

const sectorExposure = [
  { sector: 'Banks', change: 3.2 },
  { sector: 'IT', change: -1.4 },
  { sector: 'Pharma', change: 2.1 },
  { sector: 'Energy', change: 1.6 },
  { sector: 'Auto', change: -0.8 },
  { sector: 'Metals', change: 0.9 },
];

const profitDistribution = [
  { label: 'Alpha Desks', value: 2.6, display: '+₹ 2.6Cr', delta: '+7.6%', positive: true },
  { label: 'Market Making', value: 1.3, display: '+₹ 1.3Cr', delta: '+3.1%', positive: true },
  { label: 'Advisory', value: 0.8, display: '+₹ 0.8Cr', delta: '-1.4%', positive: false },
];

const profitPieData = profitDistribution.map(({ label, value }) => ({ name: label, value }));
const pieColors = ['#16a34a', '#2563eb', '#f59e0b'];

function EquityTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) {
    return null;
  }

  const [{ value }] = payload;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-neutral-700">₹ {value.toFixed(1)}Cr</p>
      <p className="text-neutral-500">{label}</p>
    </div>
  );
}

function DeskContributionTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const [{ value, payload: data }] = payload;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-neutral-700">{data.desk}</p>
      <p className="text-neutral-500">Contribution: {value}%</p>
    </div>
  );
}

function OrderFlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const buys = payload.find((item: any) => item.dataKey === 'Buys')?.value ?? 0;
  const sells = payload.find((item: any) => item.dataKey === 'Sells')?.value ?? 0;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-neutral-700">{label}</p>
      <p className="text-success-600">Buys: {buys}%</p>
      <p className="text-danger-600">Sells: {sells}%</p>
    </div>
  );
}

function ProfitTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const [{ name, value }] = payload;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-neutral-700">{name}</p>
      <p className="text-neutral-500">₹ {Number(value).toFixed(2)}Cr</p>
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
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={equityChartData} margin={{ top: 10, right: 12, bottom: 0, left: -24 }}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <RechartsTooltip content={<EquityTooltip />} cursor={{ stroke: '#2563eb', strokeOpacity: 0.2 }} />
                  <Area
                    type="monotone"
                    dataKey="nav"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#equityGradient)"
                    dot={{ r: 2.5, strokeWidth: 1, stroke: '#2563eb' }}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card
              padding="lg"
              tone="neutral"
              className="bg-white/90"
              header={<h3 className="text-sm font-semibold text-neutral-800">Desk Contribution</h3>}
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={deskContribution}
                  layout="vertical"
                  margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
                  barSize={16}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 40]} hide />
                  <YAxis
                    type="category"
                    dataKey="desk"
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip content={<DeskContributionTooltip />} cursor={{ fill: '#e2e8f0', opacity: 0.4 }} />
                  <Bar dataKey="weight" radius={[12, 12, 12, 12]}>
                    {deskContribution.map((entry) => (
                      <Cell key={entry.desk} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
                info: ShieldCheckIcon,
                warning: AdjustmentsHorizontalIcon,
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
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={orderFlowSeries} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis hide />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value) => <span className="text-neutral-500 capitalize">{value}</span>}
                />
                <RechartsTooltip content={<OrderFlowTooltip />} cursor={{ fill: '#e2e8f0', opacity: 0.3 }} />
                <Bar dataKey="Buys" stackId="orders" fill="#16a34a" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Sells" stackId="orders" fill="#dc2626" radius={[0, 0, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            padding="lg"
            tone="neutral"
            hover
            header={<h3 className="text-sm font-semibold text-neutral-800">Exposure Heatmap</h3>}
          >
            <div className="grid grid-cols-3 gap-3">
              {sectorExposure.map(({ sector, change }) => (
                <div
                  key={sector}
                  className={cn(
                    'rounded-xl border border-neutral-200 px-3 py-4 text-center shadow-sm transition-colors',
                    change >= 0 ? 'bg-success-50/70 text-success-700' : 'bg-danger-50/70 text-danger-700'
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-500/90">{sector}</p>
                  <p className="mt-1 text-lg font-semibold">
                    {change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
                  </p>
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="md:w-1/2">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={profitPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {profitPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<ProfitTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {profitDistribution.map((line) => (
                  <div
                    key={line.label}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{line.label}</p>
                      <p className="text-sm font-semibold text-neutral-900">{line.display}</p>
                    </div>
                    <span className={cn('text-xs font-semibold', line.positive ? 'text-success-600' : 'text-danger-600')}>
                      {line.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


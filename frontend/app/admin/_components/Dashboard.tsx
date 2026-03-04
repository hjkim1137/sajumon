'use client';

import { useState, useEffect, useCallback } from 'react';
import StatCard from './StatCard';
import TopAnimalsCard from './TopAnimalsCard';
import FunnelChart from './FunnelChart';
import HourlyTrafficChart from './HourlyTrafficChart';
import DeviceRatioCard from './DeviceRatioCard';
import TrendChart from './TrendChart';
import ErrorLogTable from './ErrorLogTable';
import AnimalCombinationCard from './AnimalCombinationCard';
import ThemeConversionCard from './ThemeConversionCard';
import ReferrerCard from './ReferrerCard';

interface Stats {
  todayVisitors: number;
  todayAnalyses: number;
  topAnimals: { animal: string; count: number }[];
  topThemes: { theme: string; count: number }[];
  funnel: { home: number; input: number; question: number; result: number };
  hourlyTraffic: number[];
  device: { mobile: number; desktop: number };
  avgSessionDurationMs: number;
  todayDownloads: number;
  todayShares: number;
  animalThemeCombos: Record<string, number>;
  themeConversions: { theme: string; total: number; success: number; rate: number }[];
  referrers: { referrer: string; count: number }[];
  dailyTrend: { date: string; visitors: number }[];
  weeklyTrend: { week: string; visitors: number }[];
  avgApiDurationMs: number;
  returnRate: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remain = sec % 60;
  return `${min}m ${remain}s`;
}

const THEME_NAMES: Record<string, string> = {
  health: '건강운', money: '재물운', love: '연애운', career: '직장운', study: '학업운',
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 font-mono animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-red-400 font-mono">Failed to load stats</p>
      </div>
    );
  }

  const topThemeLabel =
    stats.topThemes.length > 0
      ? THEME_NAMES[stats.topThemes[0].theme] || stats.topThemes[0].theme
      : '-';

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white font-mono">Sajumon Dashboard</h1>
          {lastUpdated && (
            <span className="text-xs text-slate-500 font-mono">
              Updated: {lastUpdated.toLocaleTimeString('ko-KR')}
            </span>
          )}
        </div>

        {/* Row 1: Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="Today Visitors" value={stats.todayVisitors} />
          <StatCard label="Today Analyses" value={stats.todayAnalyses} />
          <StatCard label="Downloads" value={stats.todayDownloads} />
          <StatCard label="Shares" value={stats.todayShares} />
        </div>

        {/* Row 2: Secondary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="Avg Session"
            value={formatDuration(stats.avgSessionDurationMs)}
          />
          <StatCard
            label="Avg API Response"
            value={`${stats.avgApiDurationMs}ms`}
          />
          <StatCard
            label="Return Rate"
            value={`${stats.returnRate}%`}
            sub="30일 기준"
          />
          <StatCard
            label="Top Theme"
            value={topThemeLabel}
            sub={stats.topThemes[0] ? `${stats.topThemes[0].count}건` : ''}
          />
        </div>

        {/* Row 3: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <TopAnimalsCard data={stats.topAnimals} />
          <FunnelChart data={stats.funnel} />
          <DeviceRatioCard data={stats.device} />
        </div>

        {/* Row 4: Traffic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <HourlyTrafficChart data={stats.hourlyTraffic} />
          <ReferrerCard data={stats.referrers} />
        </div>

        {/* Row 5: Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <TrendChart
            title="Daily Trend (30d)"
            data={stats.dailyTrend}
            labelKey="date"
            valueKey="visitors"
          />
          <TrendChart
            title="Weekly Trend (12w)"
            data={stats.weeklyTrend}
            labelKey="week"
            valueKey="visitors"
          />
        </div>

        {/* Row 6: Detailed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <ThemeConversionCard data={stats.themeConversions} />
          <AnimalCombinationCard data={stats.animalThemeCombos} />
        </div>

        {/* Row 7: Error Logs */}
        <ErrorLogTable />
      </div>
    </div>
  );
}

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
import BrowserOsCard from './BrowserOsCard';
import EndpointPerformanceCard from './EndpointPerformanceCard';

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
  totalVisitors: number;
  totalAnalyses: number;
  totalDownloads: number;
  totalShares: number;
  totalAvgSessionDurationMs: number;
  prevDay: {
    visitors: number;
    analyses: number;
    downloads: number;
    shares: number;
    avgSessionDurationMs: number;
  };
  apiP95: number;
  apiP99: number;
  browsers: { name: string; count: number }[];
  os: { name: string; count: number }[];
  endpointErrors: { endpoint: string; count: number }[];
  dailyErrorCount: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remain = sec % 60;
  return `${min}m ${remain}s`;
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

const THEME_NAMES: Record<string, string> = {
  health: '건강운', money: '재물운', love: '연애운', career: '직장운', study: '학업운',
};

export default function Dashboard({
  darkMode,
  onToggleDark,
}: {
  darkMode: boolean;
  onToggleDark: () => void;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState(getToday);

  const isToday = selectedDate === getToday();

  const fetchStats = useCallback(async () => {
    try {
      const query = isToday ? '' : `?date=${selectedDate}`;
      const res = await fetch(`/api/admin/stats${query}`);
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
  }, [selectedDate, isToday]);

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const exportCSV = () => {
    if (!stats) return;
    const rows = [
      ['항목', '값'],
      ['날짜', selectedDate],
      ['방문자', stats.todayVisitors],
      ['분석 수', stats.todayAnalyses],
      ['다운로드', stats.todayDownloads],
      ['공유', stats.todayShares],
      ['평균 체류 시간(ms)', stats.avgSessionDurationMs],
      ['전일 방문자', stats.prevDay.visitors],
      ['전일 분석 수', stats.prevDay.analyses],
      ['', ''],
      ['총 방문자', stats.totalVisitors],
      ['총 분석 수', stats.totalAnalyses],
      ['총 다운로드', stats.totalDownloads],
      ['총 공유', stats.totalShares],
      ['평균 API 응답(ms)', stats.avgApiDurationMs],
      ['API p95(ms)', stats.apiP95],
      ['API p99(ms)', stats.apiP99],
      ['재방문율(%)', stats.returnRate],
      ['', ''],
      ['퍼널 - 홈', stats.funnel.home],
      ['퍼널 - 입력', stats.funnel.input],
      ['퍼널 - 질문', stats.funnel.question],
      ['퍼널 - 결과', stats.funnel.result],
      ['', ''],
      ['기기 - 모바일', stats.device.mobile],
      ['기기 - 데스크톱', stats.device.desktop],
      ['', ''],
      ...stats.browsers.map((b) => [`브라우저 - ${b.name}`, b.count]),
      ['', ''],
      ...stats.os.map((o) => [`OS - ${o.name}`, o.count]),
      ['', ''],
      ...stats.topAnimals.map((a, i) => [`인기동물 ${i + 1}`, `${a.animal} (${a.count})`]),
      ['', ''],
      ...stats.dailyTrend.map((d) => [d.date, d.visitors]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sajumon-stats-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-t-page flex items-center justify-center">
        <p className="text-t-muted font-mono animate-pulse">대시보드 로딩 중...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-t-page flex items-center justify-center">
        <p className="text-t-danger font-mono">통계를 불러올 수 없습니다</p>
      </div>
    );
  }

  const topThemeLabel =
    stats.topThemes.length > 0
      ? THEME_NAMES[stats.topThemes[0].theme] || stats.topThemes[0].theme
      : '-';

  // Alerts
  const alerts: { level: 'error' | 'warning'; message: string }[] = [];
  const visitorDelta = calcDelta(stats.todayVisitors, stats.prevDay.visitors);
  if (visitorDelta !== null && visitorDelta <= -50) {
    alerts.push({ level: 'error', message: `방문자 전일 대비 ${visitorDelta}% 급감` });
  }
  if (stats.dailyErrorCount > 0) {
    alerts.push({ level: 'warning', message: `당일 에러 ${stats.dailyErrorCount}건 발생` });
  }
  if (stats.apiP99 > 5000) {
    alerts.push({ level: 'error', message: `API p99 응답시간 ${stats.apiP99}ms (임계치 5000ms 초과)` });
  } else if (stats.apiP99 > 3000) {
    alerts.push({ level: 'warning', message: `API p99 응답시간 ${stats.apiP99}ms (주의: 3000ms 초과)` });
  }
  if (stats.returnRate < 10 && stats.totalVisitors > 100) {
    alerts.push({ level: 'warning', message: `재방문율 ${stats.returnRate}%로 낮음` });
  }

  return (
    <div className="min-h-screen bg-t-page p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-t-heading font-mono">사주몬 대시보드</h1>
            <input
              type="date"
              value={selectedDate}
              max={getToday()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`bg-t-input text-base font-mono px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                isToday
                  ? 'border-t-input-border text-t-body'
                  : 'border-blue-500 text-blue-500'
              }`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDark}
              className="text-xs bg-t-bar hover:bg-t-bar-hover text-t-body px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer"
            >
              {darkMode ? '☀️ 라이트' : '🌙 다크'}
            </button>
            <button
              onClick={exportCSV}
              className="text-xs bg-t-bar hover:bg-t-bar-hover text-t-body px-3 py-1.5 rounded-lg font-mono transition-colors cursor-pointer"
            >
              CSV 내보내기
            </button>
            {lastUpdated && (
              <span className="text-sm text-t-heading font-mono">
                갱신: {lastUpdated.toLocaleTimeString('ko-KR')}
              </span>
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-sm font-mono ${
                  alert.level === 'error'
                    ? 'bg-t-alert-error-bg border-t-alert-error-border text-t-alert-error-text'
                    : 'bg-t-alert-warn-bg border-t-alert-warn-border text-t-alert-warn-text'
                }`}
              >
                {alert.level === 'error' ? '🚨' : '⚠️'} {alert.message}
              </div>
            ))}
          </div>
        )}

        {/* 섹션 A: 일별 현황 */}
        <h2 className="text-base font-bold text-t-heading mb-3 border-b border-t-card-border pb-2">
          📅 일별 현황 {!isToday && <span className="text-blue-500">({selectedDate})</span>}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="방문자"
            value={stats.todayVisitors}
            delta={calcDelta(stats.todayVisitors, stats.prevDay.visitors)}
            sub="전일 대비"
          />
          <StatCard
            label="분석 수"
            value={stats.todayAnalyses}
            delta={calcDelta(stats.todayAnalyses, stats.prevDay.analyses)}
            sub="전일 대비"
          />
          <StatCard
            label="다운로드"
            value={stats.todayDownloads}
            delta={calcDelta(stats.todayDownloads, stats.prevDay.downloads)}
            sub="전일 대비"
          />
          <StatCard
            label="공유"
            value={stats.todayShares}
            delta={calcDelta(stats.todayShares, stats.prevDay.shares)}
            sub="전일 대비"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="평균 체류 시간"
            value={formatDuration(stats.avgSessionDurationMs)}
            delta={calcDelta(stats.avgSessionDurationMs, stats.prevDay.avgSessionDurationMs)}
            sub="전일 대비"
          />
          <StatCard
            label="당일 에러"
            value={stats.dailyErrorCount}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <FunnelChart data={stats.funnel} />
          <HourlyTrafficChart data={stats.hourlyTraffic} />
          <DeviceRatioCard data={stats.device} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <BrowserOsCard browsers={stats.browsers} os={stats.os} />
          <EndpointPerformanceCard
            apiAvg={stats.avgApiDurationMs}
            apiP95={stats.apiP95}
            apiP99={stats.apiP99}
            endpointErrors={stats.endpointErrors}
          />
        </div>

        {/* 섹션 B: 누적 통계 */}
        <h2 className="text-base font-bold text-t-heading mb-3 border-b border-t-card-border pb-2 mt-6">
          📊 누적 통계
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard label="총 방문자" value={stats.totalVisitors} />
          <StatCard label="총 분석 수" value={stats.totalAnalyses} />
          <StatCard label="총 다운로드" value={stats.totalDownloads} />
          <StatCard label="총 공유" value={stats.totalShares} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="평균 체류 시간"
            value={formatDuration(stats.totalAvgSessionDurationMs)}
            sub="전체 기간"
          />
          <StatCard
            label="평균 API 응답"
            value={`${stats.avgApiDurationMs}ms`}
            sub={`p95: ${stats.apiP95}ms · p99: ${stats.apiP99}ms`}
          />
          <StatCard
            label="재방문율"
            value={`${stats.returnRate}%`}
            sub="30일 기준"
          />
          <StatCard
            label="인기 테마"
            value={topThemeLabel}
            sub={stats.topThemes[0] ? `${stats.topThemes[0].count}건` : ''}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <TopAnimalsCard data={stats.topAnimals} />
          <ThemeConversionCard data={stats.themeConversions} />
          <AnimalCombinationCard data={stats.animalThemeCombos} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <ReferrerCard data={stats.referrers} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
          <TrendChart
            title="일별 추이 (30일)"
            data={stats.dailyTrend}
            labelKey="date"
            valueKey="visitors"
          />
          <TrendChart
            title="주별 추이 (12주)"
            data={stats.weeklyTrend}
            labelKey="week"
            valueKey="visitors"
          />
        </div>

        <ErrorLogTable />
      </div>
    </div>
  );
}

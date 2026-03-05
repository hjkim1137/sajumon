import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdmin } from '../auth/route';

export async function GET(request: NextRequest) {
  const authorized = await verifyAdmin(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const dateParam = request.nextUrl.searchParams.get('date');
  let targetDate: Date;
  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    targetDate = new Date(dateParam + 'T00:00:00');
  } else {
    targetDate = now;
  }
  const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).toISOString();
  const targetEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1).toISOString();
  const prevStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - 1).toISOString();
  const prevEnd = targetStart;
  const fromParam = request.nextUrl.searchParams.get('from');
  const toParam = request.nextUrl.searchParams.get('to');
  const cumStart = fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam)
    ? new Date(fromParam + 'T00:00:00').toISOString()
    : null;
  const cumEnd = toParam && /^\d{4}-\d{2}-\d{2}$/.test(toParam)
    ? new Date(new Date(toParam + 'T00:00:00').getTime() + 86400000).toISOString()
    : null;

  const trendStart = cumStart || new Date(now.getTime() - 30 * 86400000).toISOString();
  const trendWeekStart = cumStart || new Date(now.getTime() - 84 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const twelveWeeksAgo = new Date(now.getTime() - 84 * 86400000).toISOString();

  const [
    todayVisitors,
    todayAnalyses,
    topAnimals,
    topThemes,
    funnelData,
    hourlyTraffic,
    deviceData,
    avgSessionDuration,
    todayDownloads,
    todayShares,
    animalThemeCombos,
    themeConversions,
    referrerData,
    dailyTrend,
    weeklyTrend,
    avgApiDuration,
    returnVisitors,
    totalSessions,
    allTimeVisitors,
    allTimeAnalyses,
    allTimeDownloads,
    allTimeShares,
    allTimeSessionDuration,
    prevDayVisitors,
    prevDayAnalyses,
    prevDayDownloads,
    prevDayShares,
    prevDaySessionDuration,
    userAgentData,
    dailyErrors,
  ] = await Promise.all([
    // 1. Target date visitors (distinct sessions)
    supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 2. Target date analyses count
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 3. Top animals
    (() => {
      let q = supabase.from('analyses').select('animal').not('animal', 'is', null);
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 4. Top themes
    (() => {
      let q = supabase.from('analyses').select('theme').not('theme', 'is', null);
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 5. Funnel data (page views by page, target date)
    supabase
      .from('page_views')
      .select('page, session_id')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 6. Hourly traffic (target date)
    supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 7. Device type distribution (target date)
    supabase
      .from('page_views')
      .select('device_type')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 8. Average session duration (target date)
    supabase
      .from('session_durations')
      .select('duration_ms')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 9. Target date downloads
    supabase
      .from('downloads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 10. Target date shares
    supabase
      .from('shares')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),

    // 11. Animal × theme combos
    (() => {
      let q = supabase.from('analyses').select('animal, theme').not('animal', 'is', null).not('theme', 'is', null);
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 12. Theme conversions (analyses with success by theme)
    (() => {
      let q = supabase.from('analyses').select('theme, success');
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 13. Referrer data
    (() => {
      let q = supabase.from('page_views').select('referrer').not('referrer', 'is', null).neq('referrer', '');
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 14. Daily trend
    (() => {
      let q = supabase.from('page_views').select('created_at, session_id');
      q = q.gte('created_at', trendStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 15. Weekly trend
    (() => {
      let q = supabase.from('page_views').select('created_at, session_id');
      q = q.gte('created_at', trendWeekStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 16. Average API duration
    (() => {
      let q = supabase.from('analyses').select('duration_ms').not('duration_ms', 'is', null);
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 17. Return visitors (sessions appearing on 2+ different days)
    (() => {
      let q = supabase.from('page_views').select('session_id, created_at');
      q = q.gte('created_at', cumStart || thirtyDaysAgo);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // Total sessions for return rate
    (() => {
      let q = supabase.from('page_views').select('session_id');
      q = q.gte('created_at', cumStart || thirtyDaysAgo);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 19. Total visitors (distinct sessions)
    (() => {
      let q = supabase.from('page_views').select('session_id');
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 20. Total analyses
    (() => {
      let q = supabase.from('analyses').select('id', { count: 'exact', head: true });
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 21. Total downloads
    (() => {
      let q = supabase.from('downloads').select('id', { count: 'exact', head: true });
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 22. Total shares
    (() => {
      let q = supabase.from('shares').select('id', { count: 'exact', head: true });
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 23. Overall avg session duration
    (() => {
      let q = supabase.from('session_durations').select('duration_ms');
      if (cumStart) q = q.gte('created_at', cumStart);
      if (cumEnd) q = q.lt('created_at', cumEnd);
      return q;
    })(),

    // 24. Previous day visitors
    supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd),

    // 25. Previous day analyses
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd),

    // 26. Previous day downloads
    supabase
      .from('downloads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd),

    // 27. Previous day shares
    supabase
      .from('shares')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd),

    // 28. Previous day avg session duration
    supabase
      .from('session_durations')
      .select('duration_ms')
      .gte('created_at', prevStart)
      .lt('created_at', prevEnd),

    // 29. User agent data (target date)
    supabase
      .from('page_views')
      .select('user_agent')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd)
      .not('user_agent', 'is', null),

    // 30. Error logs (target date)
    supabase
      .from('error_logs')
      .select('endpoint')
      .gte('created_at', targetStart)
      .lt('created_at', targetEnd),
  ]);

  // Process results

  // 1. Distinct visitors today
  const uniqueVisitors = new Set(todayVisitors.data?.map((r) => r.session_id)).size;

  // 2. Analysis count
  const analysisCount = todayAnalyses.count || 0;

  // 3. Top animals
  const animalCounts: Record<string, number> = {};
  topAnimals.data?.forEach((r) => {
    animalCounts[r.animal] = (animalCounts[r.animal] || 0) + 1;
  });
  const topAnimalsResult = Object.entries(animalCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([animal, count]) => ({ animal, count }));

  // 4. Top themes
  const themeCounts: Record<string, number> = {};
  topThemes.data?.forEach((r) => {
    themeCounts[r.theme] = (themeCounts[r.theme] || 0) + 1;
  });
  const topThemesResult = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([theme, count]) => ({ theme, count }));

  // 5. Funnel
  const funnelPages: Record<string, Set<string>> = {};
  funnelData.data?.forEach((r) => {
    if (!funnelPages[r.page]) funnelPages[r.page] = new Set();
    funnelPages[r.page].add(r.session_id);
  });
  const funnel = {
    home: funnelPages['/']?.size || 0,
    input: funnelPages['/input']?.size || 0,
    question: funnelPages['/question']?.size || 0,
    result: funnelPages['/result']?.size || 0,
  };

  // 6. Hourly traffic
  const hourly = new Array(24).fill(0);
  hourlyTraffic.data?.forEach((r) => {
    const h = new Date(r.created_at).getHours();
    hourly[h]++;
  });

  // 7. Device ratio
  let mobile = 0;
  let desktop = 0;
  deviceData.data?.forEach((r) => {
    if (r.device_type === 'mobile') mobile++;
    else desktop++;
  });

  // 8. Avg session duration
  const durations = avgSessionDuration.data?.map((r) => r.duration_ms) || [];
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

  // 9 & 10. Downloads and shares
  const downloadCount = todayDownloads.count || 0;
  const shareCount = todayShares.count || 0;

  // 11. Animal × theme combos
  const combos: Record<string, number> = {};
  animalThemeCombos.data?.forEach((r) => {
    const key = `${r.animal}:${r.theme}`;
    combos[key] = (combos[key] || 0) + 1;
  });

  // 12. Theme conversion rates
  const themeStats: Record<string, { total: number; success: number }> = {};
  themeConversions.data?.forEach((r) => {
    if (!r.theme) return;
    if (!themeStats[r.theme]) themeStats[r.theme] = { total: 0, success: 0 };
    themeStats[r.theme].total++;
    if (r.success) themeStats[r.theme].success++;
  });
  const themeConversionResult = Object.entries(themeStats).map(([theme, s]) => ({
    theme,
    total: s.total,
    success: s.success,
    rate: s.total > 0 ? Math.round((s.success / s.total) * 100) : 0,
  }));

  // 13. Referrer top list
  const refCounts: Record<string, number> = {};
  referrerData.data?.forEach((r) => {
    const ref = r.referrer || 'direct';
    refCounts[ref] = (refCounts[ref] || 0) + 1;
  });
  const referrerResult = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }));

  // 14. Daily trend
  const dailyCounts: Record<string, Set<string>> = {};
  dailyTrend.data?.forEach((r) => {
    const day = r.created_at.substring(0, 10);
    if (!dailyCounts[day]) dailyCounts[day] = new Set();
    dailyCounts[day].add(r.session_id);
  });
  const dailyResult = Object.entries(dailyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, sessions]) => ({ date, visitors: sessions.size }));

  // 15. Weekly trend
  const weeklyCounts: Record<string, Set<string>> = {};
  weeklyTrend.data?.forEach((r) => {
    const d = new Date(r.created_at);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().substring(0, 10);
    if (!weeklyCounts[key]) weeklyCounts[key] = new Set();
    weeklyCounts[key].add(r.session_id);
  });
  const weeklyResult = Object.entries(weeklyCounts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, sessions]) => ({ week, visitors: sessions.size }));

  // 16. Average API duration + p95/p99
  const apiDurations = avgApiDuration.data?.map((r) => r.duration_ms) || [];
  const sortedApi = [...apiDurations].sort((a, b) => a - b);
  const avgApi =
    apiDurations.length > 0
      ? Math.round(apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length)
      : 0;
  const pct = (arr: number[], p: number) => {
    if (arr.length === 0) return 0;
    return arr[Math.min(Math.ceil((p / 100) * arr.length) - 1, arr.length - 1)];
  };
  const apiP95 = pct(sortedApi, 95);
  const apiP99 = pct(sortedApi, 99);

  // 17. Return visitors rate
  const sessionDays: Record<string, Set<string>> = {};
  returnVisitors.data?.forEach((r) => {
    const day = r.created_at.substring(0, 10);
    if (!sessionDays[r.session_id]) sessionDays[r.session_id] = new Set();
    sessionDays[r.session_id].add(day);
  });
  const totalUniqueSessions = new Set(totalSessions.data?.map((r) => r.session_id)).size;
  const returningCount = Object.values(sessionDays).filter((days) => days.size >= 2).length;
  const returnRate =
    totalUniqueSessions > 0 ? Math.round((returningCount / totalUniqueSessions) * 100) : 0;

  // 19. All-time visitors
  const allTimeUniqueVisitors = new Set(allTimeVisitors.data?.map((r) => r.session_id)).size;

  // 20-22. All-time counts
  const allTimeAnalysisCount = allTimeAnalyses.count || 0;
  const allTimeDownloadCount = allTimeDownloads.count || 0;
  const allTimeShareCount = allTimeShares.count || 0;

  // 23. Overall avg session duration
  const allDurations = allTimeSessionDuration.data?.map((r) => r.duration_ms) || [];
  const allTimeAvgDuration =
    allDurations.length > 0
      ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length)
      : 0;

  // 24-28. Previous day data
  const prevVisitors = new Set(prevDayVisitors.data?.map((r) => r.session_id)).size;
  const prevAnalyses = prevDayAnalyses.count || 0;
  const prevDownloads = prevDayDownloads.count || 0;
  const prevShares = prevDayShares.count || 0;
  const prevDurations = prevDaySessionDuration.data?.map((r) => r.duration_ms) || [];
  const prevAvgDuration =
    prevDurations.length > 0
      ? Math.round(prevDurations.reduce((a, b) => a + b, 0) / prevDurations.length)
      : 0;

  // 29. Browser / OS parsing
  const browserCounts: Record<string, number> = {};
  const osCounts: Record<string, number> = {};
  userAgentData.data?.forEach((r) => {
    const ua = r.user_agent || '';
    let browser = '기타';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    browserCounts[browser] = (browserCounts[browser] || 0) + 1;

    let os = '기타';
    if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    osCounts[os] = (osCounts[os] || 0) + 1;
  });
  const browserResult = Object.entries(browserCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
  const osResult = Object.entries(osCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // 30. Daily endpoint errors
  const epCounts: Record<string, number> = {};
  dailyErrors.data?.forEach((r) => {
    epCounts[r.endpoint] = (epCounts[r.endpoint] || 0) + 1;
  });
  const endpointErrorResult = Object.entries(epCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([endpoint, count]) => ({ endpoint, count }));
  const dailyErrorCount = dailyErrors.data?.length || 0;

  return NextResponse.json({
    todayVisitors: uniqueVisitors,
    todayAnalyses: analysisCount,
    topAnimals: topAnimalsResult,
    topThemes: topThemesResult,
    funnel,
    hourlyTraffic: hourly,
    device: { mobile, desktop },
    avgSessionDurationMs: avgDuration,
    todayDownloads: downloadCount,
    todayShares: shareCount,
    animalThemeCombos: combos,
    themeConversions: themeConversionResult,
    referrers: referrerResult,
    dailyTrend: dailyResult,
    weeklyTrend: weeklyResult,
    avgApiDurationMs: avgApi,
    returnRate,
    totalVisitors: allTimeUniqueVisitors,
    totalAnalyses: allTimeAnalysisCount,
    totalDownloads: allTimeDownloadCount,
    totalShares: allTimeShareCount,
    totalAvgSessionDurationMs: allTimeAvgDuration,
    prevDay: {
      visitors: prevVisitors,
      analyses: prevAnalyses,
      downloads: prevDownloads,
      shares: prevShares,
      avgSessionDurationMs: prevAvgDuration,
    },
    apiP95,
    apiP99,
    browsers: browserResult,
    os: osResult,
    endpointErrors: endpointErrorResult,
    dailyErrorCount,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdmin } from '../auth/route';

export async function GET(request: NextRequest) {
  const authorized = await verifyAdmin(request);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
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
  ] = await Promise.all([
    // 1. Today visitors (distinct sessions)
    supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', todayStart),

    // 2. Today analyses count
    supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),

    // 3. Top animals
    supabase
      .from('analyses')
      .select('animal')
      .not('animal', 'is', null),

    // 4. Top themes
    supabase
      .from('analyses')
      .select('theme')
      .not('theme', 'is', null),

    // 5. Funnel data (page views by page, today)
    supabase
      .from('page_views')
      .select('page, session_id')
      .gte('created_at', todayStart),

    // 6. Hourly traffic (today)
    supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', todayStart),

    // 7. Device type distribution
    supabase
      .from('page_views')
      .select('device_type')
      .gte('created_at', todayStart),

    // 8. Average session duration
    supabase
      .from('session_durations')
      .select('duration_ms')
      .gte('created_at', todayStart),

    // 9. Today downloads
    supabase
      .from('downloads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),

    // 10. Today shares
    supabase
      .from('shares')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart),

    // 11. Animal × theme combos
    supabase
      .from('analyses')
      .select('animal, theme')
      .not('animal', 'is', null)
      .not('theme', 'is', null),

    // 12. Theme conversions (analyses with success by theme)
    supabase
      .from('analyses')
      .select('theme, success'),

    // 13. Referrer data
    supabase
      .from('page_views')
      .select('referrer')
      .not('referrer', 'is', null)
      .neq('referrer', ''),

    // 14. Daily trend (last 30 days)
    supabase
      .from('page_views')
      .select('created_at, session_id')
      .gte('created_at', thirtyDaysAgo),

    // 15. Weekly trend (last 12 weeks)
    supabase
      .from('page_views')
      .select('created_at, session_id')
      .gte('created_at', twelveWeeksAgo),

    // 16. Average API duration
    supabase
      .from('analyses')
      .select('duration_ms')
      .not('duration_ms', 'is', null),

    // 17. Return visitors (sessions appearing on 2+ different days)
    supabase
      .from('page_views')
      .select('session_id, created_at')
      .gte('created_at', thirtyDaysAgo),

    // Total sessions for return rate
    supabase
      .from('page_views')
      .select('session_id')
      .gte('created_at', thirtyDaysAgo),
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

  // 16. Average API duration
  const apiDurations = avgApiDuration.data?.map((r) => r.duration_ms) || [];
  const avgApi =
    apiDurations.length > 0
      ? Math.round(apiDurations.reduce((a, b) => a + b, 0) / apiDurations.length)
      : 0;

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
  });
}

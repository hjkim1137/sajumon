const SESSION_KEY = 'sajumon_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function fire(url: string, body: Record<string, unknown>) {
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export function trackPageView(page: string) {
  fire('/api/track/pageview', {
    sessionId: getSessionId(),
    page,
    referrer: document.referrer || null,
  });
}

export function trackDownload(animal?: string, theme?: string) {
  fire('/api/track/download', {
    sessionId: getSessionId(),
    animal,
    theme,
  });
}

export function trackShare(platform?: string) {
  fire('/api/track/share', {
    sessionId: getSessionId(),
    platform,
  });
}

export function trackSessionDuration(durationMs: number) {
  fire('/api/track/session', {
    sessionId: getSessionId(),
    durationMs,
  });
}

export function trackSessionDurationBeacon(durationMs: number) {
  const body = JSON.stringify({
    sessionId: getSessionId(),
    durationMs,
  });
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track/session', new Blob([body], { type: 'application/json' }));
  } else {
    fire('/api/track/session', { sessionId: getSessionId(), durationMs });
  }
}

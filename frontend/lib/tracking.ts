const SESSION_KEY = 'sajumon_session_id';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {

    return generateId();
  }
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

export function trackSpeech(speechText: string) {
  fire('/api/track/speech', {
    sessionId: getSessionId(),
    speechText,
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

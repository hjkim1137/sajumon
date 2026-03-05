'use client';

import { useEffect, useRef } from 'react';
import { trackSessionDurationBeacon } from './tracking';

export function useSessionDuration() {
  const startRef = useRef(Date.now());

  useEffect(() => {
    const start = startRef.current;

    const handleBeforeUnload = () => {
      const duration = Date.now() - start;
      trackSessionDurationBeacon(duration);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}

'use client';

import { useSessionDuration } from '@/lib/useSessionDuration';

export default function SessionTracker() {
  useSessionDuration();
  return null;
}

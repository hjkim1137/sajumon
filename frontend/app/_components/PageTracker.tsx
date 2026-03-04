'use client';

import { useEffect } from 'react';
import { trackPageView } from '@/lib/tracking';

export default function PageTracker({ page }: { page: string }) {
  useEffect(() => {
    trackPageView(page);
  }, [page]);

  return null;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTrack } from '@/hooks/useTrack';

export function PageViewTracker() {
  const { pathname, search } = useLocation();
  const { track } = useTrack();

  useEffect(() => {
    track({ event: 'page_view', properties: { path: pathname, query: search || '' } });
  }, [pathname, search, track]);

  return null;
}



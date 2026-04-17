import { useEffect } from 'react';

export const useVisibility = (callback) => {
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        callback();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [callback]);
};
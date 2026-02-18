import { useState, useEffect, useCallback } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

export type InitStatus = 'initializing' | 'success' | 'timeout' | 'error';

const INIT_TIMEOUT_MS = 12000; // 12 seconds

export function useAuthInit() {
  const { loginStatus, identity } = useInternetIdentity();
  const [initStatus, setInitStatus] = useState<InitStatus>('initializing');
  const [initError, setInitError] = useState<Error | undefined>(undefined);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retryInitialization = useCallback(() => {
    console.log('[Auth] Retrying initialization...');
    setInitStatus('initializing');
    setInitError(undefined);
    setRetryTrigger((prev) => prev + 1);
    // Force a page reload to restart the auth client initialization
    window.location.reload();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let cancelled = false;

    console.log('[Auth] Monitoring initialization... loginStatus:', loginStatus);

    // If we're initializing, set up a timeout
    if (loginStatus === 'initializing') {
      console.log('[Auth] Starting initialization timeout monitor');
      setInitStatus('initializing');
      
      timeoutId = setTimeout(() => {
        if (!cancelled && loginStatus === 'initializing') {
          console.error('[Auth] Initialization timeout after', INIT_TIMEOUT_MS, 'ms');
          const timeoutError = new Error('Authentication initialization timed out. Please check your connection and try again.');
          setInitStatus('timeout');
          setInitError(timeoutError);
        }
      }, INIT_TIMEOUT_MS);
    } else if (loginStatus === 'loginError') {
      // If there's a login error during init, treat it as init error
      console.error('[Auth] Initialization error detected');
      setInitStatus('error');
      setInitError(new Error('Authentication initialization failed. Please try again.'));
    } else if (loginStatus === 'idle' || loginStatus === 'success' || identity) {
      // Successfully initialized
      if (initStatus !== 'success') {
        console.log('[Auth] Initialization successful');
        setInitStatus('success');
        setInitError(undefined);
      }
    }

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loginStatus, identity, initStatus, retryTrigger]);

  return {
    initStatus,
    initError,
    retryInitialization,
  };
}

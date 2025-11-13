import { useState, useEffect, useCallback } from 'react';

export interface ConnectorStatus {
  connected: boolean;
  configured: boolean;
  timestamp?: number;
}

export interface UseConnectorReturn {
  status: ConnectorStatus | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

/**
 * Hook to manage connector status and authentication
 */
export function useConnector(provider: 'google' | 'rube'): UseConnectorReturn {
  const [status, setStatus] = useState<ConnectorStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/connectors/${provider}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check connector status');
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Error checking ${provider} status:`, err);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get auth URL
      const response = await fetch(`/api/connectors/${provider}/login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate OAuth flow');
      }

      const { authUrl } = await response.json();

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        `${provider}-oauth`,
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === `${provider}-oauth-success`) {
          window.removeEventListener('message', handleMessage);
          checkStatus();
        } else if (event.data.type === `${provider}-oauth-error`) {
          window.removeEventListener('message', handleMessage);
          setError(event.data.error || 'OAuth authentication failed');
          setLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setLoading(false);
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Error connecting ${provider}:`, err);
      setLoading(false);
    }
  }, [provider, checkStatus]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/connectors/${provider}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      await checkStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error(`Error disconnecting ${provider}:`, err);
    } finally {
      setLoading(false);
    }
  }, [provider, checkStatus]);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    loading,
    error,
    connect,
    disconnect,
    checkStatus,
  };
}

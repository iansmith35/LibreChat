import React, { useState, useEffect } from 'react';

interface Connector {
  id: string;
  name: string;
  description: string;
  type: string;
  connected: boolean;
}

export const ConnectorsPanel: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/connectors/list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load connectors');
      }

      const data = await response.json();
      setConnectors(data);
    } catch (err) {
      console.error('Error loading connectors:', err);
      setError('Failed to load connectors');
    } finally {
      setLoading(false);
    }
  };

  const connectGoogle = async () => {
    try {
      const response = await fetch('/api/connectors/google/login', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Google OAuth');
      }

      const { authUrl } = await response.json();
      
      // Open OAuth popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'google-oauth-success') {
          window.removeEventListener('message', handleMessage);
          loadConnectors(); // Refresh connector status
          if (popup) {
            popup.close();
          }
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error('Error connecting Google:', err);
      setError('Failed to connect Google account');
    }
  };

  const disconnectConnector = async (connectorId: string) => {
    try {
      const response = await fetch(`/api/connectors/${connectorId}/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      loadConnectors(); // Refresh connector status
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect');
    }
  };

  if (loading && connectors.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading connectors...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Connected Services
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {connector.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {connector.description}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    connector.connected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {connector.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>

            <div>
              {connector.connected ? (
                <button
                  onClick={() => disconnectConnector(connector.id)}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (connector.id === 'google') {
                      connectGoogle();
                    }
                  }}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {connectors.length === 0 && !loading && (
        <div className="text-center text-gray-600 dark:text-gray-400 py-8">
          No connectors available
        </div>
      )}
    </div>
  );
};

export default ConnectorsPanel;

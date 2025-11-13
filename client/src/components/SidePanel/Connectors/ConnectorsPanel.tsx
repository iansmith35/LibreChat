import React from 'react';
import { useConnector } from '~/hooks/useConnector';

interface ConnectorCardProps {
  name: string;
  provider: 'google' | 'rube';
  description: string;
  icon: React.ReactNode;
}

const ConnectorCard: React.FC<ConnectorCardProps> = ({ name, provider, description, icon }) => {
  const { status, loading, error, connect, disconnect } = useConnector(provider);

  return (
    <div className="mb-4 rounded-lg border border-border-medium bg-surface-primary p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{name}</h3>
            <p className="text-xs text-text-secondary">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status?.connected ? (
            <>
              <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
              <button
                onClick={disconnect}
                disabled={loading}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              disabled={loading || !status?.configured}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connecting...' : status?.configured ? 'Connect' : 'Not Configured'}
            </button>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      {!status?.configured && (
        <div className="mt-2 rounded-md bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          This connector needs to be configured in your environment variables. Check README for
          instructions.
        </div>
      )}
    </div>
  );
};

const ConnectorsPanel: React.FC = () => {
  return (
    <div className="h-auto max-w-full overflow-x-hidden p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">External Connectors</h2>
        <p className="text-sm text-text-secondary">
          Connect external services to enhance your LibreChat experience
        </p>
      </div>

      <div className="space-y-4">
        <ConnectorCard
          name="Google Account"
          provider="google"
          description="Connect your Google account for cloud services"
          icon={
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          }
        />

        <ConnectorCard
          name="Rube.app"
          provider="rube"
          description="Connect Rube.app for extended capabilities"
          icon={
            <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500 text-xs font-bold text-white">
              R
            </div>
          }
        />
      </div>

      <div className="mt-6 rounded-lg border border-border-medium bg-surface-secondary p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">About Connectors</h3>
        <p className="text-xs text-text-secondary">
          Connectors allow you to integrate external services with LibreChat. Once connected, these
          services can be used as tools in your conversations.
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          To set up a connector, you'll need to configure the appropriate environment variables. See
          the documentation for more details.
        </p>
      </div>
    </div>
  );
};

export default ConnectorsPanel;

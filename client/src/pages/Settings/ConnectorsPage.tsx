import React from 'react';
import ConnectorsPanel from '../../components/ConnectorsPanel';

export const ConnectorsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Connectors
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect external services to enhance your LibreChat experience.
        </p>
      </div>

      <ConnectorsPanel />
    </div>
  );
};

export default ConnectorsPage;

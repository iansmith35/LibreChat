import React, { useState, useEffect } from 'react';

interface DirectiveWindowProps {
  conversationId: string;
  onClose?: () => void;
}

interface Directive {
  conversationId: string;
  systemPrompt: string;
  personality?: string;
  memoryPolicy?: string;
  lastUpdated: number;
}

export const DirectiveWindow: React.FC<DirectiveWindowProps> = ({ conversationId, onClose }) => {
  const [systemPrompt, setSystemPrompt] = useState('');
  const [personality, setPersonality] = useState('');
  const [memoryPolicy, setMemoryPolicy] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load directive from localStorage and server
  useEffect(() => {
    loadDirective();
  }, [conversationId]);

  const loadDirective = async () => {
    try {
      // First, try to load from localStorage
      const localKey = `directive_${conversationId}`;
      const localDirective = localStorage.getItem(localKey);
      
      if (localDirective) {
        const parsed = JSON.parse(localDirective) as Directive;
        setSystemPrompt(parsed.systemPrompt || '');
        setPersonality(parsed.personality || '');
        setMemoryPolicy(parsed.memoryPolicy || '');
      }

      // Then, load from server
      const response = await fetch(`/api/agent/directive/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const serverDirective = await response.json() as Directive;
        setSystemPrompt(serverDirective.systemPrompt || '');
        setPersonality(serverDirective.personality || '');
        setMemoryPolicy(serverDirective.memoryPolicy || '');
        
        // Update localStorage with server data
        localStorage.setItem(localKey, JSON.stringify(serverDirective));
      } else if (response.status !== 404) {
        console.error('Failed to load directive from server:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading directive:', error);
      setError('Failed to load directive');
    }
  };

  const saveDirective = async () => {
    if (!systemPrompt.trim()) {
      setError('System prompt is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const directive: Directive = {
        conversationId,
        systemPrompt,
        personality,
        memoryPolicy,
        lastUpdated: Date.now(),
      };

      // Save to localStorage immediately
      const localKey = `directive_${conversationId}`;
      localStorage.setItem(localKey, JSON.stringify(directive));

      // Save to server
      const response = await fetch(`/api/agent/directive/${conversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          systemPrompt,
          personality,
          memoryPolicy,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save directive to server');
      }

      // Show success feedback
      alert('Directive saved successfully!');
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving directive:', error);
      setError('Failed to save directive');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configure Directive
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Prompt *
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={6}
              placeholder="Enter the system prompt that will guide the AI's behavior..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personality
            </label>
            <input
              type="text"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="E.g., helpful, professional, creative..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Memory Policy
            </label>
            <textarea
              value={memoryPolicy}
              onChange={(e) => setMemoryPolicy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Define how the AI should use and store memories..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              onClick={saveDirective}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Directive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectiveWindow;

import React, { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import store from '~/store';

interface Directive {
  conversationId: string;
  systemPrompt: string;
  personality: string;
  directives: string[];
  memoryPolicy: 'auto' | 'manual' | 'off';
  presets?: string[];
}

const DirectiveWindow: React.FC = () => {
  const currentConversationId = useRecoilValue(store.conversation)?.conversationId;
  const [directive, setDirective] = useState<Directive>({
    conversationId: '',
    systemPrompt: '',
    personality: '',
    directives: [],
    memoryPolicy: 'auto',
    presets: [],
  });
  const [loading, setLoading] = useState(false);
  const [newDirective, setNewDirective] = useState('');

  useEffect(() => {
    if (currentConversationId) {
      fetchDirective(currentConversationId);
    }
  }, [currentConversationId]);

  const fetchDirective = async (conversationId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/agent/directive/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setDirective(data);
      }
    } catch (error) {
      console.error('Error fetching directive:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDirective = async () => {
    if (!currentConversationId) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/agent/directive/${currentConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directive),
      });

      if (response.ok) {
        const data = await response.json();
        setDirective(data);
      }
    } catch (error) {
      console.error('Error saving directive:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDirective = () => {
    if (newDirective.trim()) {
      setDirective({
        ...directive,
        directives: [...directive.directives, newDirective.trim()],
      });
      setNewDirective('');
    }
  };

  const removeDirective = (index: number) => {
    setDirective({
      ...directive,
      directives: directive.directives.filter((_, i) => i !== index),
    });
  };

  if (!currentConversationId) {
    return (
      <div className="p-4 text-center text-text-secondary">
        Select a conversation to configure directives
      </div>
    );
  }

  return (
    <div className="h-auto max-w-full overflow-x-hidden p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Agent Directives</h2>
        <p className="text-sm text-text-secondary">
          Configure agent behavior, personality, and memory settings
        </p>
      </div>

      <div className="space-y-4">
        {/* System Prompt */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            System Prompt
          </label>
          <textarea
            value={directive.systemPrompt}
            onChange={(e) => setDirective({ ...directive, systemPrompt: e.target.value })}
            className="w-full rounded-md border border-border-medium bg-surface-primary p-2 text-sm text-text-primary"
            rows={3}
            placeholder="Enter system prompt..."
          />
        </div>

        {/* Personality */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">Personality</label>
          <input
            type="text"
            value={directive.personality}
            onChange={(e) => setDirective({ ...directive, personality: e.target.value })}
            className="w-full rounded-md border border-border-medium bg-surface-primary p-2 text-sm text-text-primary"
            placeholder="e.g., Helpful, concise, professional"
          />
        </div>

        {/* Directives List */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            Directives
          </label>
          <div className="mb-2 space-y-2">
            {directive.directives.map((dir, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-border-medium bg-surface-secondary p-2 text-sm text-text-primary">
                  {dir}
                </div>
                <button
                  onClick={() => removeDirective(index)}
                  className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDirective}
              onChange={(e) => setNewDirective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDirective()}
              className="flex-1 rounded-md border border-border-medium bg-surface-primary p-2 text-sm text-text-primary"
              placeholder="Add a new directive..."
            />
            <button
              onClick={addDirective}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Memory Policy */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text-primary">
            Memory Policy
          </label>
          <select
            value={directive.memoryPolicy}
            onChange={(e) =>
              setDirective({
                ...directive,
                memoryPolicy: e.target.value as 'auto' | 'manual' | 'off',
              })
            }
            className="w-full rounded-md border border-border-medium bg-surface-primary p-2 text-sm text-text-primary"
          >
            <option value="auto">Automatic</option>
            <option value="manual">Manual</option>
            <option value="off">Off</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={saveDirective}
          disabled={loading}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Directives'}
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-border-medium bg-surface-secondary p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-primary">About Directives</h3>
        <p className="text-xs text-text-secondary">
          Directives help you customize how the agent behaves in this conversation. System prompts
          set the overall context, personality defines the agent's communication style, and
          individual directives provide specific instructions.
        </p>
      </div>
    </div>
  );
};

export default DirectiveWindow;

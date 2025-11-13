import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import store from '~/store';

export interface Memory {
  conversationId: string;
  facts: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface UseMemoryReturn {
  memory: Memory | null;
  loading: boolean;
  error: string | null;
  saveMemory: (facts: string[]) => Promise<void>;
  clearMemory: () => Promise<void>;
  refreshMemory: () => Promise<void>;
}

/**
 * Hook to manage persistent memory for a conversation
 */
export default function useMemory(conversationId?: string): UseMemoryReturn {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentConversationId = useRecoilValue(store.conversation)?.conversationId;
  
  const activeConversationId = conversationId || currentConversationId;

  const fetchMemory = async () => {
    if (!activeConversationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory/${activeConversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch memory');
      }

      const data = await response.json();
      setMemory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMemory = async (facts: string[]) => {
    if (!activeConversationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory/${activeConversationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facts,
          metadata: memory?.metadata || {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save memory');
      }

      const data = await response.json();
      setMemory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error saving memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearMemory = async () => {
    if (!activeConversationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory/${activeConversationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear memory');
      }

      setMemory(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error clearing memory:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshMemory = async () => {
    await fetchMemory();
  };

  // Fetch memory when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMemory();
    } else {
      setMemory(null);
    }
  }, [activeConversationId]);

  return {
    memory,
    loading,
    error,
    saveMemory,
    clearMemory,
    refreshMemory,
  };
}

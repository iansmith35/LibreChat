import { useState, useEffect, useCallback } from 'react';

interface MemoryItem {
  id: string;
  conversationId: string;
  content: string;
  timestamp: number;
  enabled: boolean;
}

interface UseMemoryResult {
  memories: MemoryItem[];
  loading: boolean;
  error: string | null;
  addMemory: (content: string) => Promise<void>;
  updateMemory: (itemId: string, updates: Partial<MemoryItem>) => Promise<void>;
  deleteMemory: (itemId: string) => Promise<void>;
  clearMemories: () => Promise<void>;
  refreshMemories: () => Promise<void>;
}

export const useMemory = (conversationId: string): UseMemoryResult => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || '';
  }, []);

  const refreshMemories = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch memories');
      }

      const data = await response.json();
      setMemories(data);
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError('Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, [conversationId, getAuthToken]);

  useEffect(() => {
    refreshMemories();
  }, [refreshMemories]);

  const addMemory = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/memory/${conversationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to add memory');
        }

        const newMemory = await response.json();
        setMemories((prev) => [...prev, newMemory]);
      } catch (err) {
        console.error('Error adding memory:', err);
        setError('Failed to add memory');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, getAuthToken],
  );

  const updateMemory = useCallback(
    async (itemId: string, updates: Partial<MemoryItem>) => {
      if (!conversationId || !itemId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/memory/${conversationId}/${itemId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update memory');
        }

        const updatedMemory = await response.json();
        setMemories((prev) =>
          prev.map((mem) => (mem.id === itemId ? updatedMemory : mem)),
        );
      } catch (err) {
        console.error('Error updating memory:', err);
        setError('Failed to update memory');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, getAuthToken],
  );

  const deleteMemory = useCallback(
    async (itemId: string) => {
      if (!conversationId || !itemId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/memory/${conversationId}/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete memory');
        }

        setMemories((prev) => prev.filter((mem) => mem.id !== itemId));
      } catch (err) {
        console.error('Error deleting memory:', err);
        setError('Failed to delete memory');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, getAuthToken],
  );

  const clearMemories = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clear memories');
      }

      setMemories([]);
    } catch (err) {
      console.error('Error clearing memories:', err);
      setError('Failed to clear memories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, getAuthToken]);

  return {
    memories,
    loading,
    error,
    addMemory,
    updateMemory,
    deleteMemory,
    clearMemories,
    refreshMemories,
  };
};

export default useMemory;

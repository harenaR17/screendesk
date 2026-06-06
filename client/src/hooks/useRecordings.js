import { useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api.js';

export function useRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchRecordings();
      setRecordings(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteRecording = useCallback(async (id) => {
    // Optimistic update.
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    try {
      await api.deleteRecording(id);
    } catch (err) {
      setError(err);
    }
  }, []);

  const renameRecording = useCallback(async (id, title) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === id ? { ...r, title } : r))
    );
    try {
      await api.renameRecording(id, title);
    } catch (err) {
      setError(err);
    }
  }, []);

  return {
    recordings,
    loading,
    error,
    deleteRecording,
    renameRecording,
    refetch,
  };
}

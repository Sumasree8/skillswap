import { useState, useEffect, useCallback } from 'react';
import { swapsApi } from '../services/api';
import { getSocket } from '../services/socket';

export const useSwaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSwaps = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await swapsApi.getMy();
      setSwaps(data.swaps);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchSwaps();
    const socket = getSocket();
    if (!socket) return;
    const onUpdate = () => fetchSwaps();
    socket.on('swap:new_request', onUpdate);
    socket.on('swap:accepted', onUpdate);
    socket.on('swap:rejected', onUpdate);
    socket.on('swap:completed', onUpdate);
    return () => {
      socket.off('swap:new_request', onUpdate);
      socket.off('swap:accepted', onUpdate);
      socket.off('swap:rejected', onUpdate);
      socket.off('swap:completed', onUpdate);
    };
  }, [fetchSwaps]);

  return { swaps, loading, refetch: fetchSwaps };
};

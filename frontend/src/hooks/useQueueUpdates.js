// src/hooks/useQueueUpdates.js
import { useEffect, useState } from 'react';

function useQueueUpdates(maxEvents = 50) {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/queues");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setUpdates(prev => {
          const newUpdates = [...prev, data];
          // Limit to last 50 events
          return newUpdates.slice(-maxEvents);
        });
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [maxEvents]);

  return updates;
}

export default useQueueUpdates;

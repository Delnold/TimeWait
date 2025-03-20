// frontend/src/hooks/useQueueUpdates.js
import { useEffect, useState } from 'react';

function useQueueUpdates() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/queues");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setUpdates(prev => [...prev, data]);
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
  }, []);

  return updates; // array of { event_type, payload } objects
}

export default useQueueUpdates;

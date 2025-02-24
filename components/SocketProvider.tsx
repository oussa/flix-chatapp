'use client';

import { useEffect } from 'react';
import { SocketContext, getSocket } from '@/lib/socket';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const socket = getSocket();

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
} 
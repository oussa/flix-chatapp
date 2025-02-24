'use client';

import { SocketProvider } from '@/components/SocketProvider';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SocketProvider>{children}</SocketProvider>;
} 
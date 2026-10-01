import { useEffect, type PropsWithChildren } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { connectSocket, disconnectSocket } from '../../lib/socket';

export function SocketProvider({ children }: PropsWithChildren): JSX.Element {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
      return () => disconnectSocket();
    }

    disconnectSocket();
    return undefined;
  }, [isAuthenticated]);

  return <>{children}</>;
}

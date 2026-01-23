import { useEffect, useRef } from 'react';

export function useWebviewMessage(handler: (message: any) => void): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      handlerRef.current(event.data);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
}

import { useEffect, useRef } from 'react';

import { host } from '../redux/api';

/**
 * Reusable WebSocket hook for subscribing to a single sport event stream.
 * Handles subscribe on open, JSON message parsing, optional custom open/message/error
 * callbacks, and clean teardown on unmount or target change.
 */
export function useSportEventSocket({
  enabled = true,
  subscribePayload,
  onMessage,
  onOpen,
  onError,
  onClose,
}) {
  const socketRef = useRef(null);
  const handlersRef = useRef({ onMessage, onOpen, onError, onClose });

  useEffect(() => {
    handlersRef.current = { onMessage, onOpen, onError, onClose };
  }, [onMessage, onOpen, onError, onClose]);

  const serializedPayload = subscribePayload
    ? JSON.stringify(subscribePayload)
    : null;

  useEffect(() => {
    if (!enabled || !serializedPayload) return undefined;

    const socket = new WebSocket(host);
    socketRef.current = socket;

    socket.onopen = () => {
      try {
        socket.send(serializedPayload);
      } catch {
        // Ignore send errors if socket closed immediately
      }
      handlersRef.current.onOpen?.(socket);
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        handlersRef.current.onMessage?.(parsed, socket);
      } catch {
        // Ignore malformed non-JSON frames
      }
    };

    socket.onerror = (err) => {
      handlersRef.current.onError?.(err);
    };

    socket.onclose = (ev) => {
      handlersRef.current.onClose?.(ev);
    };

    return () => {
      socketRef.current = null;
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
    };
  }, [enabled, serializedPayload]);

  return socketRef;
}

export default useSportEventSocket;

'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const DEFAULT_WS_URL = 'http://141.11.156.52:3002/orderbook';
const WS_URL = process.env.NEXT_PUBLIC_ORDERBOOK_WS ?? DEFAULT_WS_URL;

function resolveSocketUrl(): string {
  const fallback = WS_URL?.trim() ?? '';

  if (typeof window === 'undefined') {
    return fallback || DEFAULT_WS_URL;
  }

  const base = fallback.length > 0 ? fallback : `${window.location.origin}${new URL(DEFAULT_WS_URL).pathname}`;

  try {
    const url = new URL(base, window.location.origin);
    const pageProtocol = window.location.protocol;

    if (pageProtocol === 'https:' && (url.protocol === 'http:' || url.protocol === 'ws:')) {
      url.protocol = url.protocol === 'ws:' ? 'wss:' : 'https:';
    }

    if (pageProtocol === 'http:' && url.protocol === 'wss:') {
      url.protocol = 'ws:';
    }

    return url.toString();
  } catch {
    return base;
  }
}

export type OrderBookSide = {
  price?: number | string | null;
  qty?: number | string | null;
};

export type OrderBookMessage = {
  symbol?: string | null;
  bid?: OrderBookSide | null;
  ask?: OrderBookSide | null;
  ts?: number | string | null;
};

export type OrderBookStreamStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

export interface UseOrderBookStreamResult {
  data: OrderBookMessage | null;
  status: OrderBookStreamStatus;
  error: string | null;
  activeSymbol: string | null;
}

export function useOrderBookStream(symbol?: string | null): UseOrderBookStreamResult {
  const [status, setStatus] = useState<OrderBookStreamStatus>('idle');
  const [data, setData] = useState<OrderBookMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const subscribedSymbolRef = useRef<string | null>(null);

  useEffect(() => {
    const resolvedUrl = resolveSocketUrl();

    const socket = io(resolvedUrl, { transports: ['websocket'], autoConnect: false });
    socketRef.current = socket;

    const handleConnect = () => {
      setStatus('connected');
      setError(null);
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
    };

    const handleOrderBook = (payload: OrderBookMessage) => {
      setData(payload ?? null);
      if (payload?.symbol) {
        setActiveSymbol(String(payload.symbol).toUpperCase());
      }
    };

    const handleError = (err: unknown) => {
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
      setError(message);
      setStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('orderbook', handleOrderBook);
    socket.on('connect_error', handleError);
    socket.on('error', handleError);

    return () => {
      if (subscribedSymbolRef.current && socket.connected) {
        socket.emit('unsubscribe', { symbol: subscribedSymbolRef.current });
      }
      subscribedSymbolRef.current = null;
      setActiveSymbol(null);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('orderbook', handleOrderBook);
      socket.off('connect_error', handleError);
      socket.off('error', handleError);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const trimmed = symbol?.trim();
    if (!trimmed) {
      if (socket.connected && subscribedSymbolRef.current) {
        socket.emit('unsubscribe', { symbol: subscribedSymbolRef.current });
      }
      subscribedSymbolRef.current = null;
      setActiveSymbol(null);
      setData(null);
      return;
    }

    const nextSymbol = trimmed.toUpperCase();

    const subscribeCurrent = () => {
      if (!socket.connected) return;
      if (subscribedSymbolRef.current && subscribedSymbolRef.current !== nextSymbol) {
        socket.emit('unsubscribe', { symbol: subscribedSymbolRef.current });
      }
      socket.emit('subscribe', { symbol: nextSymbol });
      subscribedSymbolRef.current = nextSymbol;
      setActiveSymbol(nextSymbol);
    };

    if (!socket.connected) {
      setStatus('connecting');
      setError(null);
      socket.connect();
      const handleConnect = () => {
        subscribeCurrent();
        socket.off('connect', handleConnect);
      };
      socket.on('connect', handleConnect);

      return () => {
        socket.off('connect', handleConnect);
        if (socket.connected && subscribedSymbolRef.current === nextSymbol) {
          socket.emit('unsubscribe', { symbol: nextSymbol });
          subscribedSymbolRef.current = null;
          setActiveSymbol(null);
        }
      };
    }

    subscribeCurrent();

    return () => {
      if (socket.connected) {
        socket.emit('unsubscribe', { symbol: nextSymbol });
      }
      if (subscribedSymbolRef.current === nextSymbol) {
        subscribedSymbolRef.current = null;
      }
      setActiveSymbol(null);
    };
  }, [symbol]);

  return { data, status, error, activeSymbol };
}

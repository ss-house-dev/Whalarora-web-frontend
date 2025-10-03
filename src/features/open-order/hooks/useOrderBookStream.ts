'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_NAMESPACE = '/orderbook';
const SOCKET_PATH = '/socket.io/';

function resolveWsEndpoint(): string {
  const raw = process.env.NEXT_PUBLIC_ORDERBOOK_WS?.trim();
  const fallbackOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://whalarora.sshouse.dev';

  // ถ้า raw เป็น absolute ก็ใช้เลย; ถ้าเป็น relative (หรือว่าง) ให้ผูกกับ origin
  const url = new URL(raw && raw.length > 0 ? raw : SOCKET_NAMESPACE, fallbackOrigin);

  // บังคับให้เป็น secure scheme เมื่อจำเป็น
  if (url.protocol === 'http:') url.protocol = 'https:';
  if (url.protocol === 'ws:') url.protocol = 'wss:';

  // ให้ path ลงท้ายด้วย /orderbook เสมอ
  if (!url.pathname.endsWith(SOCKET_NAMESPACE)) {
    const trimmedPath = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
    url.pathname = `${trimmedPath}${SOCKET_NAMESPACE}`;
  }
  return url.toString();
}

const WS_URL = resolveWsEndpoint();

export type OrderBookSide = { price?: number | string | null; qty?: number | string | null };
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
  const initialSymbolRef = useRef<string | null>(symbol?.trim()?.toUpperCase() || null);

  // สร้าง socket instance ครั้งเดียว
  useEffect(() => {
    const opts: Parameters<typeof io>[1] = {
      path: SOCKET_PATH,
      transports: ['websocket'],
      autoConnect: false,
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // ส่ง query ตอนต่อครั้งแรก (ถ้ามี symbol ตั้งต้น จะได้ snapshot ทันทีจาก handleConnection)
      query: initialSymbolRef.current ? { symbol: initialSymbolRef.current } : undefined,
    };

    console.log('[orderbook] init WS_URL =', WS_URL);
    console.log('[orderbook] init options =', { ...opts, query: opts.query });

    const socket = io(WS_URL, opts);
    socketRef.current = socket;

    const handleConnect = () => {
      console.log('[orderbook] connected. id =', socket.id);
      setStatus('connected');
      setError(null);
    };

    const handleDisconnect = (reason: string) => {
      console.warn('[orderbook] disconnect:', reason);
      setStatus('disconnected');
    };

    const handleOrderBook = (payload: OrderBookMessage) => {
      console.log('[orderbook] event:', payload);
      const normalizedSymbol = payload?.symbol ? String(payload.symbol).toUpperCase() : null;
      setData(payload ?? null);
      if (normalizedSymbol) setActiveSymbol(normalizedSymbol);
    };

    const handleError = (err: unknown) => {
      const message =
        typeof err === 'string'
          ? err
          : err instanceof Error
            ? err.message
            : (err as { message?: string })?.message || 'Unknown error';
      console.error('[orderbook] error:', err);
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
        console.log('[orderbook] cleanup unsubscribe:', subscribedSymbolRef.current);
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
      console.log('[orderbook] socket disconnected (unmount)');
    };
  }, []);

  // จัดการ subscribe/unsubscribe ตาม symbol
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const trimmed = symbol?.trim();
    if (!trimmed) {
      if (socket.connected && subscribedSymbolRef.current) {
        console.log('[orderbook] unsubscribe (no symbol):', subscribedSymbolRef.current);
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
        console.log('[orderbook] switch unsubscribe:', subscribedSymbolRef.current);
        socket.emit('unsubscribe', { symbol: subscribedSymbolRef.current });
      }
      console.log('[orderbook] subscribe:', nextSymbol);
      socket.emit('subscribe', { symbol: nextSymbol });
      subscribedSymbolRef.current = nextSymbol;
      setActiveSymbol(nextSymbol);
    };

    if (!socket.connected) {
      console.log('[orderbook] connecting…');
      setStatus('connecting');
      setError(null);

      const onConnect = () => {
        console.log('[orderbook] connected → do subscribe');
        subscribeCurrent();
        socket.off('connect', onConnect);
      };

      socket.on('connect', onConnect);
      socket.connect();

      return () => {
        socket.off('connect', onConnect);
        if (socket.connected && subscribedSymbolRef.current === nextSymbol) {
          console.log('[orderbook] cleanup unsubscribe (connecting case):', nextSymbol);
          socket.emit('unsubscribe', { symbol: nextSymbol });
          subscribedSymbolRef.current = null;
          setActiveSymbol(null);
        }
      };
    }

    // already connected
    subscribeCurrent();

    return () => {
      if (socket.connected) {
        console.log('[orderbook] cleanup unsubscribe:', nextSymbol);
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

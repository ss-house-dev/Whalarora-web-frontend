// src/features/wallet/hooks/useBinanceTicker.ts
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBinancePairs } from '../services/getBinancePairs';
import { getSpotPrices } from '../services/getSpotPrices';

const dedup = (arr: string[]) => Array.from(new Set(arr));

export function useBinanceTicker(baseSymbols: string[]) {
  const symbols = useMemo(() => dedup(baseSymbols.filter(Boolean)), [baseSymbols]);

  // 1) map base->pair (BTC -> BTCUSDT) cache ยาว
  const pairsQ = useQuery({
    queryKey: ['binance:pairs'],
    queryFn: getBinancePairs,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 6 * 60 * 60 * 1000,
  });

  // 2) snapshot แรกด้วย REST (ให้ตัวเลขขึ้นทันที)
  const snapQ = useQuery({
    queryKey: ['binance:snapshot', symbols.join(',')],
    queryFn: () => getSpotPrices(symbols),
    enabled: symbols.length > 0,
    staleTime: 5_000,
    refetchOnWindowFocus: false,
    // ให้วิ่งแม้แท็บไม่โฟกัส (กันกรณีไม่มี WS)
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });

  // 3) WebSocket สด + auto-reconnect
  const [live, setLive] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pairsQ.data || symbols.length === 0) return;

    const pairs = symbols.map((s) => pairsQ.data![s] ?? `${s}USDT`).filter(Boolean);
    if (pairs.length === 0) return;

    const streams = pairs.map((p) => `${p.toLowerCase()}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    let closedByUs = false;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        const s = msg?.data?.s as string; // eg. BTCUSDT
        const c = Number(msg?.data?.c); // last price
        if (!s || !Number.isFinite(c)) return;
        const base = s.replace(/USDT$/i, '').toUpperCase();
        // สร้าง object ใหม่ทุกครั้ง -> กระตุ้น re-render
        setLive((prev) => (prev[base] === c ? prev : { ...prev, [base]: c }));
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!closedByUs) {
          // auto-reconnect ภายใน 2s
          reconnectTimer.current = setTimeout(connect, 2000);
        }
      };
      ws.onerror = () => ws.close();
    };

    connect();

    const onVis = () => {
      if (document.visibilityState === 'visible' && !wsRef.current) {
        // แท็บกลับมาแล้ว ไม่มี ws -> ต่อใหม่
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        connect();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      closedByUs = true;
      document.removeEventListener('visibilitychange', onVis);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [pairsQ.data, symbols.join(',')]);

  const map = useMemo(() => ({ ...(snapQ.data ?? {}), ...(live ?? {}) }), [snapQ.data, live]);

  const isLoading =
    (pairsQ.isLoading && !pairsQ.data) || (symbols.length > 0 && snapQ.isLoading && !snapQ.data);
  return { data: map, isLoading };
}

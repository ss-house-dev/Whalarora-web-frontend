'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineStyle,
  UTCTimestamp,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { useCoinContext } from '@/features/trading/contexts/CoinContext';

// Real-time candlestick chart using Binance data so it matches useMarketPrice speed
// Replaces TradingView widget to avoid external data delays.

type KlineArray = [
  number, // open time (ms)
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // close time (ms)
  string, // quote asset volume
  number, // number of trades
  string, // taker buy base asset volume
  string, // taker buy quote asset volume
  string, // ignore
];

type WsKlineMessage = {
  e: 'kline';
  E: number;
  s: string;
  k: {
    t: number; // start time
    T: number; // end time
    s: string; // symbol
    i: string; // interval
    f: number; // first trade ID
    L: number; // last trade ID
    o: string; // open
    c: string; // close
    h: string; // high
    l: string; // low
    v: string; // volume
    n: number; // number of trades
    x: boolean; // is this kline closed?
    q: string; // quote volume
    V: string; // taker buy base
    Q: string; // taker buy quote
    B: string; // ignore
  };
};

const DEFAULT_INTERVAL = '15m'; // 1m/5m/15m/1h supported

function intervalToMs(interval: string): number {
  const m = interval.match(/^(\d+)([mhd])$/i);
  if (!m) return 60_000; // default 1m
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  if (u === 'm') return n * 60_000;
  if (u === 'h') return n * 3_600_000;
  if (u === 'd') return n * 86_400_000;
  return 60_000;
}

function parseSymbol(coinValue: string) {
  // input example: BINANCE:BTCUSDT -> BTCUSDT
  const v = coinValue.replace('BINANCE:', '').toUpperCase();
  return v;
}

async function fetchPrecision(symbol: string): Promise<number> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await res.json();
    const info = data.symbols?.find((s: any) => s.symbol === symbol);
    const priceFilter = info?.filters?.find((f: any) => f.filterType === 'PRICE_FILTER');
    const tickSize = parseFloat(priceFilter?.tickSize ?? '0');
    if (tickSize > 0) {
      return Math.max(0, Math.round(-Math.log10(tickSize)));
    }
  } catch (e) {
    // ignore, fall through
  }
  return 2;
}

const AdvancedChart = () => {
  const { selectedCoin } = useCoinContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  // Removed last price line rendering per request
  const wsRef = useRef<WebSocket | null>(null);
  const lastBarRef = useRef<CandlestickData | null>(null);
  const lastBarTimeRef = useRef<UTCTimestamp | null>(null);
  const intervalMsRef = useRef<number>(intervalToMs(DEFAULT_INTERVAL));
  const barsRef = useRef<CandlestickData[]>([]);
  const volAggRef = useRef<number>(0);
  // extra series
  const lineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const smaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  // toolbar state
  const [interval, setIntervalState] = useState<string>(DEFAULT_INTERVAL);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showSMA, setShowSMA] = useState<boolean>(false);
  const [showEMA, setShowEMA] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const setIntervalSafe = (v: string) => {
    setIntervalState(v);
    intervalMsRef.current = intervalToMs(v);
  };
  const [ready, setReady] = useState(false);

  // 1) Initialize chart only once (avoid stacking/overlap)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || chartRef.current) return;

    // ensure container is clean
    container.innerHTML = '';

    const chart = createChart(container, {
      width: container.clientWidth || 900,
      height: 540,
      layout: {
        background: { type: ColorType.Solid, color: '#0b0f14' },
        textColor: '#d1d5db',
      },
      grid: {
        horzLines: { color: 'rgba(197,203,206,0.1)' },
        vertLines: { color: 'rgba(197,203,206,0.1)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(197,203,206,0.4)',
        scaleMargins: { top: 0.2, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'rgba(197,203,206,0.4)',
        fixLeftEdge: false,
        rightOffset: 5,
      },
    });

    const candle = chart.addSeries(CandlestickSeries, {});
    // additional series for toolbar
    const line = chart.addSeries(LineSeries, { color: '#4cc9f0', lineWidth: 2, visible: false });
    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      color: '#6b7280',
      visible: showVolume,
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    const sma = chart.addSeries(LineSeries, { color: '#e0c097', lineWidth: 2, visible: false });
    const ema = chart.addSeries(LineSeries, { color: '#ff9800', lineWidth: 2, visible: false });

    chartRef.current = chart;
    candleRef.current = candle;
    lineRef.current = line;
    volumeRef.current = volume;
    smaRef.current = sma;
    emaRef.current = ema;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width: Math.floor(width) });
    });
    resizeObserver.observe(container);

    setReady(true);

    return () => {
      resizeObserver.unobserve(container);
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch {}
      }
      chartRef.current = null;
      candleRef.current = null;
    };
  }, []);

  // recompute indicators using barsRef
  const recomputeIndicators = () => {
    const bars = barsRef.current;
    // update close line (for line chart)
    if (lineRef.current) {
      const mapped = bars.map((b) => ({ time: b.time as UTCTimestamp, value: b.close }) as any);
      lineRef.current.setData(mapped);
    }
    // SMA 20
    if (smaRef.current) {
      const len = 20;
      const out: any[] = [];
      let sum = 0;
      for (let i = 0; i < bars.length; i++) {
        sum += bars[i].close;
        if (i >= len) sum -= bars[i - len].close;
        if (i >= len - 1)
          out.push({ time: bars[i].time as UTCTimestamp, value: +(sum / len).toFixed(8) });
      }
      smaRef.current.setData(out);
      smaRef.current.applyOptions({ visible: showSMA });
    }
    // EMA 50
    if (emaRef.current) {
      const len = 50;
      const out: any[] = [];
      const k = 2 / (len + 1);
      let emaVal: number | null = null;
      for (let i = 0; i < bars.length; i++) {
        const c = bars[i].close;
        if (emaVal === null) emaVal = c;
        else emaVal = c * k + emaVal * (1 - k);
        if (i >= len - 1)
          out.push({ time: bars[i].time as UTCTimestamp, value: +emaVal.toFixed(8) });
      }
      emaRef.current.setData(out);
      emaRef.current.applyOptions({ visible: showEMA });
    }
  };

  // 2) React to symbol change without removing chart (avoid flicker)
  useEffect(() => {
    const run = async () => {
      const chart = chartRef.current;
      const candle = candleRef.current;
      if (!chart || !candle) return;

      const symbol = parseSymbol(selectedCoin.value);
      const lc = symbol.toLowerCase();

      // close previous socket
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }

      // set precision and formatter
      const precision = await fetchPrecision(symbol);
      chart.applyOptions({
        localization: { priceFormatter: (p: number) => p.toFixed(precision) },
      });
      candle.applyOptions({
        priceFormat: { type: 'price', precision },
        visible: chartType === 'candles',
      });
      if (lineRef.current) lineRef.current.applyOptions({ visible: chartType === 'line' });
      if (volumeRef.current) volumeRef.current.applyOptions({ visible: showVolume });

      // reset data and load history for new symbol
      candle.setData([]);
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;
        const resp = await fetch(url);
        const rows: KlineArray[] = await resp.json();
        const data: CandlestickData[] = rows.map((r) => ({
          time: Math.floor(r[0] / 1000) as UTCTimestamp,
          open: parseFloat(r[1]),
          high: parseFloat(r[2]),
          low: parseFloat(r[3]),
          close: parseFloat(r[4]),
        }));
        candle.setData(data);
        chart.timeScale().fitContent();
        // keep track of bars & last bar
        barsRef.current = data;
        const last = data[data.length - 1];
        lastBarRef.current = last ?? null;
        lastBarTimeRef.current = (last?.time as UTCTimestamp) ?? null;

        // set volume from history
        if (volumeRef.current) {
          const volData = rows.map((r) => ({
            time: Math.floor(r[0] / 1000) as UTCTimestamp,
            value: parseFloat(r[5]),
            color: parseFloat(r[4]) >= parseFloat(r[1]) ? '#26a69a' : '#ef5350',
          }));
          volumeRef.current.setData(volData as any);
          volAggRef.current = volData.length ? (volData[volData.length - 1] as any).value : 0;
        }

        recomputeIndicators();
      } catch (e) {
        console.error('Chart: failed to load history', e);
      }

      // subscribe realtime trade stream (faster than kline)
      const wsUrl = `wss://stream.binance.com:9443/ws/${lc}@trade`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        const series = candleRef.current;
        if (!series) return;
        try {
          const d = JSON.parse(ev.data);
          // trade payload: { e: 'trade', T: time(ms), p: price }
          const price = parseFloat(d.p);
          const tMs: number = d.T || d.E || Date.now();
          if (!isFinite(price) || price <= 0) return;

          const intervalMs = intervalMsRef.current;
          const barStartMs = Math.floor(tMs / intervalMs) * intervalMs;
          const barTime = Math.floor(barStartMs / 1000) as UTCTimestamp;

          let bar = lastBarRef.current;
          if (!bar || (lastBarTimeRef.current ?? 0) < barTime) {
            bar = {
              time: barTime,
              open: price,
              high: price,
              low: price,
              close: price,
            };
            lastBarRef.current = bar;
            lastBarTimeRef.current = barTime;
            // push new bar & reset volume agg
            barsRef.current = [...barsRef.current, bar];
            volAggRef.current = parseFloat(d.q ?? '0') || 0;
          } else {
            // update existing bar
            bar.close = price;
            if (price > bar.high) bar.high = price;
            if (price < bar.low) bar.low = price;
            const arr = barsRef.current;
            if (arr.length) arr[arr.length - 1] = { ...bar };
            volAggRef.current += parseFloat(d.q ?? '0') || 0;
          }

          series.update(bar);
          if (lineRef.current && chartType === 'line') {
            lineRef.current.update({ time: bar.time as UTCTimestamp, value: bar.close } as any);
          }
          if (volumeRef.current && showVolume) {
            volumeRef.current.update({
              time: bar.time as UTCTimestamp,
              value: volAggRef.current,
              color: bar.close >= bar.open ? '#26a69a' : '#ef5350',
            } as any);
          }
          recomputeIndicators();
        } catch {}
      };

      ws.onerror = (e) => console.error('Chart WS error', e);
    };

    run();

    // only close socket on symbol change/unmount; keep chart intact
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [selectedCoin.value, interval, chartType, showSMA, showEMA, showVolume]);

  return (
    <div style={{ width: '100%', maxWidth: 900 }}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-200">
        <div className="font-medium mr-2">{selectedCoin.label}</div>
        <div className="flex gap-1">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setIntervalSafe(tf)}
              className={`px-2 py-1 rounded border ${interval === tf ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1324] border-[#1f2937]'}`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="ml-2 flex gap-1">
          <button
            onClick={() => setChartType('candles')}
            className={`px-2 py-1 rounded border ${chartType === 'candles' ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1324] border-[#1f2937]'}`}
          >
            Candle
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2 py-1 rounded border ${chartType === 'line' ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1324] border-[#1f2937]'}`}
          >
            Line
          </button>
        </div>
        <div className="ml-2 flex gap-1">
          <button
            onClick={() => setShowSMA((v) => !v)}
            className={`px-2 py-1 rounded border ${showSMA ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1324] border-[#1f2937]'}`}
          >
            SMA20
          </button>
          <button
            onClick={() => setShowEMA((v) => !v)}
            className={`px-2 py-1 rounded border ${showEMA ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1324] border-[#1f2937]'}`}
          >
            EMA50
          </button>
          <button
            onClick={() => setShowVolume((v) => !v)}
            className={`px-2 py-1 rounded border ${showVolume ? 'bg-blue-600 border-blue-500' : 'bg-[#0b1324] border-[#1f2937]'}`}
          >
            Vol
          </button>
          <button
            onClick={() => chartRef.current?.timeScale().fitContent()}
            className="px-2 py-1 rounded border bg-[#0b1324] border-[#1f2937]"
          >
            Fit
          </button>
        </div>
      </div>
      <div ref={containerRef} style={{ width: '100%', height: 540 }} aria-busy={!ready} />
    </div>
  );
};

export default AdvancedChart;

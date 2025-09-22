'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineStyle,
  CrosshairMode,
  UTCTimestamp,
  TickMarkType,
  Time,
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

// Create a stable-width price formatter to prevent right axis jitter
// but keep the right scale compact. Width is computed from the maximum
// integer digits we expect (baseline) plus decimal precision.
function makeFixedWidthFormatter(precision: number, baseIntDigits: number) {
  const labelPrecision = Math.min(Math.max(0, precision), 8);
  const addCommas = (numStr: string) => {
    const [i, d = ''] = numStr.split('.');
    const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return d ? `${withCommas}.${d}` : withCommas;
  };
  const commaCount = Math.max(0, Math.floor((Math.max(1, baseIntDigits) - 1) / 3));
  const target = Math.max(
    // int digits + commas + optional dot + decimals
    Math.max(1, baseIntDigits) + commaCount + (labelPrecision > 0 ? 1 + labelPrecision : 0),
    // ensure a sane minimum so tiny prices still align nicely
    6 + (labelPrecision > 0 ? 1 + Math.min(labelPrecision, 4) : 0)
  );
  return (p: number) => {
    const fixed = isFinite(p) ? p.toFixed(labelPrecision) : '0';
    const withCommas = addCommas(fixed);
    return withCommas.padStart(target, ' ');
  };
}

// Same formatter but reads current base digits from a ref so series labels
// (last value bubble) stay in sync with the axis width without reapplying options.
function makeSeriesFormatter(precision: number, baseIntDigitsRef: React.MutableRefObject<number>) {
  const labelPrecision = Math.min(Math.max(0, precision), 8);
  const addCommas = (numStr: string) => {
    const [i, d = ''] = numStr.split('.');
    const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return d ? `${withCommas}.${d}` : withCommas;
  };
  return (p: number) => {
    const baseIntDigits = Math.max(1, baseIntDigitsRef.current);
    const commaCount = Math.max(0, Math.floor((baseIntDigits - 1) / 3));
    const target = Math.max(
      baseIntDigits + commaCount + (labelPrecision > 0 ? 1 + labelPrecision : 0),
      6 + (labelPrecision > 0 ? 1 + Math.min(labelPrecision, 4) : 0)
    );
    const fixed = isFinite(p) ? p.toFixed(labelPrecision) : '0';
    const withCommas = addCommas(fixed);
    return withCommas.padStart(target, ' ');
  };
}

// Custom time scale tick formatter based on selected interval
function makeTickFormatter(currentInterval: string) {
  const intraday = ['1m', '5m', '15m', '1h', '4h'];
  const isIntraday = intraday.includes(currentInterval);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Always display in UTC+7 (Bangkok). We offset epoch seconds by +7h
  return (time: Time, tickMarkType: TickMarkType, _locale?: string): string => {
    const ts = typeof time === 'number' ? time : ((time as any).timestamp ?? 0);
    const offsetMs = 7 * 60 * 60 * 1000; // UTC+7
    const d = new Date((ts as number) * 1000 + offsetMs);
    const Y = d.getUTCFullYear();
    const M = pad(d.getUTCMonth() + 1);
    const D = pad(d.getUTCDate());
    const h = pad(d.getUTCHours());
    const m = pad(d.getUTCMinutes());

    switch (tickMarkType) {
      case TickMarkType.Year:
        return String(Y);
      case TickMarkType.Month:
        return `${Y}/${M}`;
      case TickMarkType.DayOfMonth:
        // Show MM/DD on day breaks
        return `${M}/${D}`;
      default:
        // Time-level ticks
        if (isIntraday) {
          // 15m: show only whole hours (HH:00); hide intermediate :15/:30/:45
          if (currentInterval === '15m') {
            return m === '00' ? `${h}:00` : '';
          }
          // 1h/4h: show HH:00
          if (currentInterval === '1h' || currentInterval === '4h') {
            return `${h}:00`;
          }
          // 1m/5m: show HH:mm
          return `${h}:${m}`;
        }
        // For 1d and above fall back to date
        return `${M}/${D}`;
    }
  };
}

const isIntradayInterval = (v: string) => ['1m', '5m', '15m', '1h', '4h'].includes(v);

// Crosshair/time tooltip formatter: always UTC+7 as YYYY/MM/DD HH:mm
function timeFormatterUTC7(time: Time): string {
  const ts = typeof time === 'number' ? time : ((time as any).timestamp ?? 0);
  const d = new Date((ts as number) * 1000 + 7 * 60 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const Y = d.getUTCFullYear();
  const M = pad(d.getUTCMonth() + 1);
  const D = pad(d.getUTCDate());
  const h = pad(d.getUTCHours());
  const m = pad(d.getUTCMinutes());
  return `${Y}/${M}/${D} ${h}:${m}`;
}

const AdvancedChart = () => {
  const { selectedCoin } = useCoinContext();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeTooltipRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  // Removed last price line rendering per request
  const wsRef = useRef<WebSocket | null>(null);
  const lastBarRef = useRef<CandlestickData | null>(null);
  const lastBarTimeRef = useRef<UTCTimestamp | null>(null);
  const intervalMsRef = useRef<number>(intervalToMs(DEFAULT_INTERVAL));
  const barsRef = useRef<CandlestickData[]>([]);
  const volAggRef = useRef<number>(0);
  // baseline for computing compact, fixed-width price labels
  const baseIntDigitsRef = useRef<number>(1);
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
      // draw slightly shorter than wrapper to avoid bottom clipping under rounded corners
      height: 500,
      layout: {
        background: { type: ColorType.Solid, color: '#0C0F17' },
        textColor: '#d1d5db',
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      },
      localization: {
        timeFormatter: timeFormatterUTC7,
      },
      grid: {
        horzLines: { color: 'rgba(197,203,206,0.1)' },
        vertLines: { color: 'rgba(197,203,206,0.1)' },
      },
      rightPriceScale: {
        borderColor: 'rgba(197,203,206,0.4)',
        scaleMargins: { top: 0.2, bottom: 0.2 },
        visible: true,
      },
      timeScale: {
        borderColor: 'rgba(197,203,206,0.4)',
        fixLeftEdge: false,
        rightOffset: 5,
        tickMarkFormatter: makeTickFormatter(interval),
        timeVisible: isIntradayInterval(interval),
        secondsVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          visible: true,
          labelVisible: false,
          color: '#9CA3AF',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          visible: true,
          labelVisible: true,
          color: '#9CA3AF',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
    });

    // Create main candlestick series with proper price label settings
    const candle = chart.addSeries(CandlestickSeries, {
      priceScaleId: 'right',
      // Ensure price label is always visible
      lastValueVisible: true,
      priceLineVisible: true,
    });

    // additional series for toolbar
    const line = chart.addSeries(LineSeries, {
      color: '#4cc9f0',
      lineWidth: 2,
      visible: false,
      priceScaleId: 'right',
      // Keep price label for line chart too
      lastValueVisible: true,
      priceLineVisible: true,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      color: '#6b7280',
      visible: showVolume,
      // Hide last-value label/line for volume series only (red box)
      lastValueVisible: false,
      priceLineVisible: false,
    });
    // Keep volume on its own hidden price scale so main price numbers always show on the right
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      visible: false,
    });
    const sma = chart.addSeries(LineSeries, {
      color: '#e0c097',
      lineWidth: 2,
      visible: false,
      priceScaleId: 'right',
    });
    const ema = chart.addSeries(LineSeries, {
      color: '#ff9800',
      lineWidth: 2,
      visible: false,
      priceScaleId: 'right',
    });

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

    // Custom time tooltip that follows crosshair (UTC+7)
    const unsub = chart.subscribeCrosshairMove((param) => {
      const tooltip = timeTooltipRef.current;
      if (!tooltip) return;
      const p = param.point;
      if (param.time && p && p.x != null && p.y != null) {
        tooltip.style.display = 'block';
        // clamp within container width
        const x = Math.max(8, Math.min(p.x, (container.clientWidth || 900) - 8));
        tooltip.style.left = `${x}px`;
        tooltip.textContent = timeFormatterUTC7(param.time);
      } else {
        tooltip.style.display = 'none';
      }
    });

    setReady(true);

    return () => {
      resizeObserver.unobserve(container);
      try {
        chart.unsubscribeCrosshairMove(unsub as any);
      } catch {}
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

  // 2) React to symbol/interval change without removing chart (avoid flicker)
  //    Add run guards to avoid race conditions when switching fast
  const runSeqRef = useRef(0);
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

      // increment run sequence to invalidate older async work
      const myRun = ++runSeqRef.current;

      // set precision for series and a stable-width formatter for axis labels
      const precision = await fetchPrecision(symbol);
      if (myRun !== runSeqRef.current) return; // aborted
      const minMove = Math.pow(10, -precision);
      // Apply chart options (time & crosshair). We'll set priceFormatter after we know base digits.
      chart.applyOptions({
        localization: {
          // temporary minimal formatter; will be replaced after history loads
          priceFormatter: makeFixedWidthFormatter(precision, baseIntDigitsRef.current),
          timeFormatter: timeFormatterUTC7,
        },
        timeScale: {
          tickMarkFormatter: makeTickFormatter(interval),
          timeVisible: isIntradayInterval(interval),
          secondsVisible: false,
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            visible: true,
            labelVisible: false,
            color: '#9CA3AF',
            width: 1,
            style: LineStyle.Dashed,
          },
          horzLine: {
            visible: true,
            labelVisible: true,
            color: '#9CA3AF',
            width: 1,
            style: LineStyle.Dashed,
          },
        },
      });

      // Apply options with explicit price label settings
      candle.applyOptions({
        priceFormat: {
          type: 'custom',
          minMove,
          formatter: makeSeriesFormatter(precision, baseIntDigitsRef),
        },
        visible: chartType === 'candles',
        // Ensure price labels are always visible for main series
        lastValueVisible: true,
        priceLineVisible: true,
      });

      if (lineRef.current) {
        lineRef.current.applyOptions({
          visible: chartType === 'line',
          priceFormat: {
            type: 'custom',
            minMove,
            formatter: makeSeriesFormatter(precision, baseIntDigitsRef),
          },
          // Keep price label for line chart
          lastValueVisible: chartType === 'line',
          priceLineVisible: chartType === 'line',
        });
      }

      if (volumeRef.current) {
        volumeRef.current.applyOptions({
          visible: showVolume,
          // Volume should not show price label
          lastValueVisible: false,
          priceLineVisible: false,
        });
      }

      // reset data and load history for new symbol
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;
        const resp = await fetch(url);
        const rows: KlineArray[] = await resp.json();
        if (myRun !== runSeqRef.current) return; // aborted
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

        // compute base integer digits from historical highs to keep right scale compact
        const maxHigh = data.reduce((m, b) => (b.high > m ? b.high : m), 0);
        const intPart = Math.floor(Math.abs(maxHigh));
        const baseDigits = intPart === 0 ? 1 : Math.floor(Math.log10(intPart)) + 1;
        baseIntDigitsRef.current = Math.max(1, baseDigits);
        chart.applyOptions({
          localization: {
            priceFormatter: makeFixedWidthFormatter(precision, baseIntDigitsRef.current),
            timeFormatter: timeFormatterUTC7,
          },
        });

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
        // ignore late messages from stale sockets
        if (myRun !== runSeqRef.current || ws !== wsRef.current) return;
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
          // If integer digit count grows beyond baseline, widen once (no jitter)
          const intPart = Math.floor(Math.abs(price));
          const digitsNow = intPart === 0 ? 1 : Math.floor(Math.log10(intPart)) + 1;
          if (digitsNow > baseIntDigitsRef.current) {
            baseIntDigitsRef.current = digitsNow;
            const precision = (series.options() as any)?.priceFormat?.precision ?? 2;
            if (chartRef.current) {
              chartRef.current.applyOptions({
                localization: {
                  priceFormatter: makeFixedWidthFormatter(precision, baseIntDigitsRef.current),
                  timeFormatter: timeFormatterUTC7,
                },
              });
            }
          }
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
    };

    run();

    // only close socket on symbol/interval change/unmount; keep chart intact
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
        wsRef.current = null;
      }
    };
  }, [selectedCoin.value, interval]);

  // 3) Apply simple visibility/style toggles without reloading data or sockets
  useEffect(() => {
    const candle = candleRef.current;
    const line = lineRef.current;
    const sma = smaRef.current;
    const ema = emaRef.current;
    const volume = volumeRef.current;

    if (candle) {
      candle.applyOptions({
        visible: chartType === 'candles',
        // Always show price label for active chart type
        lastValueVisible: chartType === 'candles',
        priceLineVisible: chartType === 'candles',
      });
    }

    if (line) {
      line.applyOptions({
        visible: chartType === 'line',
        // Show price label only when line chart is active
        lastValueVisible: chartType === 'line',
        priceLineVisible: chartType === 'line',
      });
    }

    if (sma) {
      sma.applyOptions({
        visible: showSMA,
        // Don't show price labels for indicators to avoid clutter
        lastValueVisible: false,
        priceLineVisible: false,
      });
    }

    if (ema) {
      ema.applyOptions({
        visible: showEMA,
        // Don't show price labels for indicators to avoid clutter
        lastValueVisible: false,
        priceLineVisible: false,
      });
    }

    if (volume) {
      volume.applyOptions({
        visible: showVolume,
        // Never show price labels for volume
        lastValueVisible: false,
        priceLineVisible: false,
      });
    }
  }, [chartType, showSMA, showEMA, showVolume]);

  return (
    <div className="w-full max-w-[900px]">
      <div className="relative w-full h-[508px]">
        <div
          ref={containerRef}
          className="rounded-xl overflow-hidden bg-[#0C0F17] border border-[#1f2937] w-full h-full cursor-crosshair"
          aria-busy={!ready}
        />
        {/* Custom time tooltip (UTC+7) */}
        <div
          ref={timeTooltipRef}
          style={{ display: 'none', transform: 'translateX(-50%)' }}
          className="pointer-events-none absolute bottom-2 z-20 px-2 py-1 text-xs text-gray-200 bg-[#16171D] border border-[#1f2937] rounded-md shadow"
        />
        <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-1 text-xs text-gray-200 cursor-pointer">
          {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setIntervalSafe(tf)}
              className={`px-2 py-1 rounded border backdrop-blur-sm ${
                interval === tf
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-black/30 hover:bg-black/40 border-[#1f2937] text-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedChart;

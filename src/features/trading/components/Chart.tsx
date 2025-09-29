'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  BusinessDay,
  LineData,
  HistogramData,
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

const DEFAULT_INTERVAL = '15m'; // 1m/5m/15m/1h supported
// Keep right price scale width stable across symbols by fixing
// baseline integer digits and decimal width used for padding
const AXIS_BASE_INT_DIGITS = 6; // supports up to 999,999 before widening
const AXIS_DECIMALS_WIDTH = 2; // pad width for up to 8 decimals

function parseSymbol(coinValue: string) {
  // input example: BINANCE:BTCUSDT -> BTCUSDT
  const v = coinValue.replace('BINANCE:', '').toUpperCase();
  return v;
}

interface BinancePriceFilter {
  filterType: string;
  tickSize?: string;
}

interface BinanceSymbolInfo {
  symbol: string;
  filters?: BinancePriceFilter[];
}

interface BinanceExchangeInfo {
  symbols?: BinanceSymbolInfo[];
}

interface BinanceKlineData {
  e: 'kline';
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
  };
}

type BinanceKlineMessage = BinanceKlineData | { stream: string; data: BinanceKlineData };

async function fetchPrecision(symbol: string): Promise<number> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = (await res.json()) as BinanceExchangeInfo;
    const info = data.symbols?.find((s) => s.symbol === symbol);
    const priceFilter = info?.filters?.find((f) => f.filterType === 'PRICE_FILTER');
    const tickSize = parseFloat(priceFilter?.tickSize ?? '0');
    if (tickSize > 0) {
      return Math.max(0, Math.round(-Math.log10(tickSize)));
    }
  } catch {
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
  // Fixed target width uses constant decimal width so axis doesn't shift
  const target = Math.max(
    Math.max(1, baseIntDigits) +
      commaCount +
      (AXIS_DECIMALS_WIDTH > 0 ? 1 + AXIS_DECIMALS_WIDTH : 0),
    8 // guarantee a usable minimum
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
      baseIntDigits + commaCount + (AXIS_DECIMALS_WIDTH > 0 ? 1 + AXIS_DECIMALS_WIDTH : 0),
      8
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
  return (time: Time, tickMarkType: TickMarkType): string => {
    const ts = toUnixSeconds(time);
    if (ts == null) return '';
    const offsetMs = 7 * 60 * 60 * 1000; // UTC+7
    const d = new Date(ts * 1000 + offsetMs);
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

type TimeWithTimestamp = { timestamp: UTCTimestamp };

function isTimeWithTimestamp(
  value: Time | BusinessDay | TimeWithTimestamp
): value is TimeWithTimestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    'timestamp' in value &&
    typeof (value as Partial<TimeWithTimestamp>).timestamp === 'number'
  );
}

function isBusinessDay(value: Time | BusinessDay | TimeWithTimestamp): value is BusinessDay {
  return (
    typeof value === 'object' &&
    value !== null &&
    'year' in value &&
    'month' in value &&
    'day' in value
  );
}

function toUnixSeconds(time: Time): number | null {
  if (typeof time === 'number') return time;
  if (isTimeWithTimestamp(time)) return time.timestamp;
  if (isBusinessDay(time)) {
    return Math.floor(Date.UTC(time.year, time.month - 1, time.day) / 1000);
  }
  return null;
}

function resolveTimestamp(time: Time): UTCTimestamp | null {
  const unix = toUnixSeconds(time);
  return unix == null ? null : (unix as UTCTimestamp);
}

// Crosshair/time tooltip formatter: always UTC+7 as YYYY/MM/DD HH:mm
function timeFormatterUTC7(time: Time): string {
  const ts = toUnixSeconds(time);
  if (ts == null) return '';
  const d = new Date(ts * 1000 + 7 * 60 * 60 * 1000);
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
  const barsRef = useRef<CandlestickData[]>([]);
  const volumeHistoryRef = useRef<Map<UTCTimestamp, number>>(new Map());
  const runSeqRef = useRef(0);
  // baseline for computing compact, fixed-width price labels
  const baseIntDigitsRef = useRef<number>(AXIS_BASE_INT_DIGITS);
  // price precision cache
  const precisionRef = useRef<number>(2);
  // extra series
  const lineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const smaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const emaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  // toolbar state
  const [interval, setIntervalState] = useState<string>(DEFAULT_INTERVAL);
  const [chartType] = useState<'candles' | 'line'>('candles');
  const [showSMA] = useState<boolean>(false);
  const [showEMA] = useState<boolean>(false);
  const [showVolume] = useState<boolean>(true);
  const setIntervalSafe = (v: string) => {
    setIntervalState(v);
  };
  const [ready, setReady] = useState(false);

  // 1) Initialize chart only once (avoid stacking/overlap)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || chartRef.current) return;

    const sequenceRef = runSeqRef;

    // ensure container is clean
    container.innerHTML = '';

    const chartHeight = Math.max(240, container.clientHeight || 400);

    const chart = createChart(container, {
      width: container.clientWidth || 900,
      height: chartHeight,
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
        tickMarkFormatter: makeTickFormatter(DEFAULT_INTERVAL),
        timeVisible: isIntradayInterval(DEFAULT_INTERVAL),
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
      visible: true,
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
      const { width, height } = entries[0].contentRect;
      if (!chartRef.current) return; // chart might be disposed
      const nextWidth = Math.max(0, Math.floor(width));
      const nextHeightSource = height || container.clientHeight;
      const nextHeight = Math.max(240, Math.floor(nextHeightSource || chartHeight));
      chart.applyOptions({ width: nextWidth, height: nextHeight });
    });
    resizeObserver.observe(container);

    // Custom time tooltip that follows crosshair (UTC+7)
    const crosshairHandler: Parameters<IChartApi['subscribeCrosshairMove']>[0] = (param) => {
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
    };
    chart.subscribeCrosshairMove(crosshairHandler);

    setReady(true);

    return () => {
      // Invalidate any in-flight async work for symbol/interval effect
      sequenceRef.current += 1;
      try {
        resizeObserver.unobserve(container);
      } catch {}
      try {
        resizeObserver.disconnect();
      } catch {}
      try {
        chart.unsubscribeCrosshairMove(crosshairHandler);
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
  const recomputeIndicators = useCallback(() => {
    const bars = barsRef.current;
    if (lineRef.current) {
      const mapped: LineData[] = bars.map((b) => ({ time: b.time, value: b.close }));
      lineRef.current.setData(mapped);
    }

    if (smaRef.current) {
      const len = 20;
      const out: LineData[] = [];
      let sum = 0;
      for (let i = 0; i < bars.length; i++) {
        sum += bars[i].close;
        if (i >= len) sum -= bars[i - len].close;
        if (i >= len - 1) {
          out.push({ time: bars[i].time, value: Number((sum / len).toFixed(8)) });
        }
      }
      smaRef.current.setData(out);
      smaRef.current.applyOptions({ visible: showSMA });
    }

    if (emaRef.current) {
      const len = 50;
      const out: LineData[] = [];
      const k = 2 / (len + 1);
      let emaVal: number | null = null;
      for (let i = 0; i < bars.length; i++) {
        const c = bars[i].close;
        emaVal = emaVal === null ? c : c * k + emaVal * (1 - k);
        if (i >= len - 1) {
          out.push({ time: bars[i].time, value: Number(emaVal.toFixed(8)) });
        }
      }
      emaRef.current.setData(out);
      emaRef.current.applyOptions({ visible: showEMA });
    }
  }, [showEMA, showSMA]);

  // 2) React to symbol/interval change without removing chart (avoid flicker)
  //    Add run guards to avoid race conditions when switching fast
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

      // Reset cached state so new intervals do not reuse stale bars
      barsRef.current = [];
      lastBarRef.current = null;
      lastBarTimeRef.current = null;
      volumeHistoryRef.current.clear();
      candle.setData([]);
      if (lineRef.current) {
        lineRef.current.setData([]);
      }
      if (volumeRef.current) {
        volumeRef.current.setData([]);
      }

      // Apply immediate axis/series format using cached precision (fast render)
      const getCachedPrecision = (): number => {
        try {
          const s = localStorage.getItem('wl_precisionCache');
          if (s) {
            const obj = JSON.parse(s);
            const key = selectedCoin.label; // e.g., BTC/USDT
            const p = obj?.[key];
            if (typeof p === 'number' && p >= 0 && p <= 8) return p;
          }
        } catch {}
        return 2;
      };
      const initialPrecision = getCachedPrecision();
      precisionRef.current = initialPrecision;
      const initialMinMove = Math.pow(10, -initialPrecision);
      chart.applyOptions({
        localization: {
          priceFormatter: makeFixedWidthFormatter(initialPrecision, baseIntDigitsRef.current),
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
      candle.applyOptions({
        priceFormat: {
          type: 'custom',
          minMove: initialMinMove,
          formatter: makeSeriesFormatter(initialPrecision, baseIntDigitsRef),
        },
        visible: chartType === 'candles',
        lastValueVisible: true,
        priceLineVisible: true,
      });
      if (lineRef.current) {
        lineRef.current.applyOptions({
          visible: chartType === 'line',
          priceFormat: {
            type: 'custom',
            minMove: initialMinMove,
            formatter: makeSeriesFormatter(initialPrecision, baseIntDigitsRef),
          },
          lastValueVisible: chartType === 'line',
          priceLineVisible: chartType === 'line',
        });
      }
      if (volumeRef.current) {
        volumeRef.current.applyOptions({
          visible: showVolume,
          lastValueVisible: false,
          priceLineVisible: false,
        });
      }

      // Connect realtime WS immediately for faster first updates
      const wsUrl = `wss://stream.binance.com:9443/ws/${lc}@kline_${interval}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (ev: MessageEvent<string>) => {
        // ignore late messages from stale sockets
        if (myRun !== runSeqRef.current || ws !== wsRef.current) return;
        const series = candleRef.current;
        if (!series) return;
        try {
          if (typeof ev.data !== 'string') return;
          const payload = JSON.parse(ev.data) as BinanceKlineMessage;
          const message = 'data' in payload ? payload.data : payload;
          if (!message || message.e !== 'kline') return;
          const k = message.k;
          if (!k || k.i !== interval) return;

          const open = Number.parseFloat(k.o);
          const high = Number.parseFloat(k.h);
          const low = Number.parseFloat(k.l);
          const close = Number.parseFloat(k.c);
          if (![open, high, low, close].every((v) => Number.isFinite(v))) return;

          const barTime = Math.floor(k.t / 1000) as UTCTimestamp;
          const newBar: CandlestickData = { time: barTime, open, high, low, close };

          const previousBars = barsRef.current;
          const lastExisting = previousBars[previousBars.length - 1];
          const lastExistingTs = lastExisting ? resolveTimestamp(lastExisting.time as Time) : null;
          const isLatestBarUpdate = lastExistingTs == null || lastExistingTs <= barTime;
          let nextBars: CandlestickData[];

          if (lastExistingTs == null || lastExistingTs < barTime) {
            nextBars = [...previousBars, newBar];
            series.update(newBar);
          } else if (lastExistingTs === barTime) {
            nextBars = [...previousBars.slice(0, -1), newBar];
            series.update(newBar);
          } else {
            const adjusted = [...previousBars];
            const idx = adjusted.findIndex((b) => resolveTimestamp(b.time as Time) === barTime);
            if (idx >= 0) {
              adjusted[idx] = newBar;
              series.setData(adjusted);
              nextBars = adjusted;
            } else {
              return;
            }
          }

          barsRef.current = nextBars;
          lastBarRef.current = newBar;
          lastBarTimeRef.current = barTime;

          const volumeValue = Number.parseFloat(k.v);
          if (Number.isFinite(volumeValue)) {
            volumeHistoryRef.current.set(barTime, volumeValue);
            if (volumeRef.current && showVolume) {
              if (isLatestBarUpdate) {
                volumeRef.current.update({
                  time: barTime,
                  value: volumeValue,
                  color: close >= open ? '#26a69a' : '#ef5350',
                });
              } else {
                const volumeSeries: HistogramData[] = nextBars.map((bar) => {
                  const resolved = resolveTimestamp(bar.time as Time);
                  const ts = (resolved ?? (bar.time as UTCTimestamp)) as UTCTimestamp;
                  return {
                    time: ts,
                    value: volumeHistoryRef.current.get(ts) ?? 0,
                    color: bar.close >= bar.open ? '#26a69a' : '#ef5350',
                  };
                });
                volumeRef.current.setData(volumeSeries);
              }
            }
          }

          if (lineRef.current && chartType === 'line' && isLatestBarUpdate) {
            lineRef.current.update({ time: barTime, value: close });
          }

          recomputeIndicators();
        } catch {}
      };

      // Fetch precision in parallel and apply when ready
      (async () => {
        const precision = await fetchPrecision(symbol);
        if (myRun !== runSeqRef.current) return;
        precisionRef.current = precision;
        const minMove = Math.pow(10, -precision);
        if (!chartRef.current || chartRef.current !== chart) return;
        chart.applyOptions({
          localization: {
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
        if (!candleRef.current || candleRef.current !== candle) return;
        candle.applyOptions({
          priceFormat: {
            type: 'custom',
            minMove,
            formatter: makeSeriesFormatter(precision, baseIntDigitsRef),
          },
          visible: chartType === 'candles',
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
            lastValueVisible: chartType === 'line',
            priceLineVisible: chartType === 'line',
          });
        }
        if (volumeRef.current) {
          volumeRef.current.applyOptions({
            visible: showVolume,
            lastValueVisible: false,
            priceLineVisible: false,
          });
        }
      })();

      // reset data and load history for new symbol (in parallel with WS)
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
        // If WS already started appending current bar, avoid overriding it
        if (barsRef.current.length === 0) {
          if (!candleRef.current || candleRef.current !== candle) return;
          candle.setData(data);
          barsRef.current = data;
        } else {
          // Merge: keep existing (WS) bars, but backfill history if it ends before
          const lastHist = data[data.length - 1]?.time as UTCTimestamp | undefined;
          const wsLast = barsRef.current[barsRef.current.length - 1]?.time as
            | UTCTimestamp
            | undefined;
          if (!wsLast || (lastHist && wsLast <= lastHist)) {
            if (!candleRef.current || candleRef.current !== candle) return;
            candle.setData(data);
            barsRef.current = data;
          }
        }
        if (chartRef.current === chart) {
          chart.timeScale().fitContent();
        }
        // keep track of last bar
        const last = barsRef.current[barsRef.current.length - 1] ?? data[data.length - 1];
        lastBarRef.current = last ?? null;
        lastBarTimeRef.current = (last?.time as UTCTimestamp) ?? null;

        // lock axis label width to fixed baseline to avoid jitter across symbols
        baseIntDigitsRef.current = AXIS_BASE_INT_DIGITS;
        if (!chartRef.current || chartRef.current !== chart) return;
        chart.applyOptions({
          localization: {
            priceFormatter: makeFixedWidthFormatter(precisionRef.current, baseIntDigitsRef.current),
            timeFormatter: timeFormatterUTC7,
          },
        });

        // set volume from history
        if (volumeRef.current) {
          volumeHistoryRef.current.clear();
          const volData: HistogramData[] = rows.map((r) => {
            const time = Math.floor(r[0] / 1000) as UTCTimestamp;
            const value = Number.parseFloat(r[5]);
            volumeHistoryRef.current.set(time, value);
            return {
              time,
              value,
              color: Number.parseFloat(r[4]) >= Number.parseFloat(r[1]) ? '#26a69a' : '#ef5350',
            };
          });
          volumeRef.current.setData(volData);
        }

        recomputeIndicators();
      } catch (e) {
        console.error('Chart: failed to load history', e);
      }

      // WS already started above
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
  }, [
    selectedCoin.value,
    selectedCoin.label,
    interval,
    chartType,
    showVolume,
    recomputeIndicators,
  ]);

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
    <div className="w-full">
      <div className="relative h-[260px] w-full sm:h-[320px] md:h-[380px] lg:h-[508px]">
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
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 overflow-x-auto text-xs text-gray-200 cursor-pointer">
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

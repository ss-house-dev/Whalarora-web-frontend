'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

type HistoryStatus = 'closed' | 'complete';
type HistorySide = 'buy' | 'sell';

const HISTORY_STATUS_META: Record<
  HistoryStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  complete: { label: 'Complete', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
  closed: { label: 'Closed', dotColor: '#4ED7B0', textColor: '#4ED7B0' },
};

const SIDE_META: Record<HistorySide, { label: string; badgeColor: string }> = {
  buy: { label: 'Buy', badgeColor: '#217871' },
  sell: { label: 'Sell', badgeColor: '#D84C4C' },
};

const COPY_RESET_TIMEOUT_MS = 1600;
const CLIP_DURATION_MS = 320;
const CLIP_TRANSITION = {
  duration: CLIP_DURATION_MS / 1000,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};
const CLIP_VISIBLE = { clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 };
const CLIP_HIDDEN = { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 };
const FEEDBACK_SUCCESS_TEXT = 'Copied!';
const FEEDBACK_FAILURE_TEXT = 'Copy failed';
const TEXT_CONTAINER_CLASSES =
  'relative inline-flex items-center justify-start overflow-hidden align-middle';
const TEXT_LAYER_CLASSES =
  'absolute inset-0 flex items-center text-current whitespace-nowrap pointer-events-none';
const TEXT_LAYER_STYLE: React.CSSProperties = {
  willChange: 'clip-path, opacity',
};
const VISUALLY_HIDDEN_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export interface HistoryCardProps {
  status: HistoryStatus;
  side: HistorySide;
  pair: string; // e.g. BTC/USDT
  date: string; // e.g. 13-Aug-2025
  time: string; // e.g. 14:30:30
  orderId: string; // full id; will be shortened visually
  amount: string; // formatted amount e.g. 0.020000000
  baseSymbol: string; // e.g. BTC
  price: string; // e.g. 115,200.00
  currency: string; // e.g. USD
}

function shortenId(id: string) {
  if (!id) return '';
  if (id.length <= 10) return id;
  return `${id.slice(0, 5)}...${id.slice(-5)}`;
}

export default function HistoryCard({
  status,
  side,
  pair,
  date,
  time,
  orderId,
  amount,
  baseSymbol,
  price,
  currency,
}: HistoryCardProps) {
  const isMobile = useIsMobile();
  const statusMeta = HISTORY_STATUS_META[status];
  const sideMeta = SIDE_META[side];
  const rightTopLabel = status === 'complete' ? 'Matched' : 'Amount';
  const shortenedOrderId = shortenId(orderId);
  const hasDateInfo = Boolean(date || time);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const orderTextControls = useAnimation();
  const feedbackTextControls = useAnimation();
  const shouldReduceMotion = useReducedMotion();
  const copyResetRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyResetRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(copyResetRef.current);
        copyResetRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    orderTextControls.set(CLIP_VISIBLE);
    feedbackTextControls.set(CLIP_HIDDEN);
  }, [orderTextControls, feedbackTextControls]);

  const showCopyFeedback = useCallback(
    async (nextState: 'copied' | 'error') => {
      orderTextControls.stop();
      feedbackTextControls.stop();
      setCopyState(nextState);
      if (shouldReduceMotion) {
        await orderTextControls.set(CLIP_HIDDEN);
        await feedbackTextControls.set(CLIP_VISIBLE);
        return;
      }

      await feedbackTextControls.set(CLIP_HIDDEN);
      await orderTextControls.start({
        ...CLIP_HIDDEN,
        transition: CLIP_TRANSITION,
      });
      await feedbackTextControls.start({
        ...CLIP_VISIBLE,
        transition: CLIP_TRANSITION,
      });
    },
    [feedbackTextControls, orderTextControls, shouldReduceMotion]
  );

  const resetCopyFeedback = useCallback(async () => {
    orderTextControls.stop();
    feedbackTextControls.stop();
    if (shouldReduceMotion) {
      await feedbackTextControls.set(CLIP_HIDDEN);
      setCopyState('idle');
      await orderTextControls.set(CLIP_VISIBLE);
      return;
    }

    await feedbackTextControls.start({
      ...CLIP_HIDDEN,
      transition: CLIP_TRANSITION,
    });
    setCopyState('idle');
    await orderTextControls.start({
      ...CLIP_VISIBLE,
      transition: CLIP_TRANSITION,
    });
  }, [feedbackTextControls, orderTextControls, shouldReduceMotion]);

  const scheduleCopyReset = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (copyResetRef.current !== null) {
      window.clearTimeout(copyResetRef.current);
    }

    copyResetRef.current = window.setTimeout(() => {
      void resetCopyFeedback();
      copyResetRef.current = null;
    }, COPY_RESET_TIMEOUT_MS);
  }, [resetCopyFeedback]);

  const copyOrderIdToClipboard = async () => {
    if (!orderId) {
      return;
    }

    let didCopy = false;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderId);
        didCopy = true;
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = orderId;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        didCopy = document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      didCopy = false;
    }

    void showCopyFeedback(didCopy ? 'copied' : 'error');
    scheduleCopyReset();
  };

  const copyFeedback = useMemo(() => {
    if (copyState === 'copied') {
      return FEEDBACK_SUCCESS_TEXT;
    }
    if (copyState === 'error') {
      return FEEDBACK_FAILURE_TEXT;
    }
    return '';
  }, [copyState]);
  const maxDisplayCharacters = useMemo(
    () =>
      Math.max(shortenedOrderId.length, FEEDBACK_SUCCESS_TEXT.length, FEEDBACK_FAILURE_TEXT.length),
    [shortenedOrderId]
  );
  const textContainerStyle = useMemo(
    () => ({
      width: `${maxDisplayCharacters}ch`,
      minHeight: '1.2em',
      flex: '0 0 auto',
    }),
    [maxDisplayCharacters]
  );
  const liveRegionMessage = copyFeedback;
  const copyButtonClasses =
    'inline-flex items-center gap-1 px-0 py-0 text-[#E9E9E9] text-xs font-normal font-[Alexandria] leading-none bg-transparent transition-colors hover:text-[#225FED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4ED7B0]';
  const copyButtonAriaLabel = orderId ? `Copy full order ID ${orderId}` : 'Copy full order ID';

  if (isMobile) {
    return (
      <article className="flex w-full flex-col gap-4 rounded-xl border border-[#474747] bg-[#16171D] p-4">
        <header className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-2 rounded-full"
              style={{ backgroundColor: statusMeta.dotColor }}
            />
            <span className="font-normal leading-none" style={{ color: statusMeta.textColor }}>
              {statusMeta.label}
            </span>
          </div>
          {hasDateInfo && (
            <div className="flex items-center gap-2 whitespace-nowrap text-xs text-[#A4A4A4]">
              {date ? <span>{date}</span> : null}
              {time ? <span>{time}</span> : null}
            </div>
          )}
        </header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex h-7 min-w-[3.5rem] items-center justify-center rounded-lg px-3 text-xs font-normal leading-none text-white"
              style={{ backgroundColor: sideMeta.badgeColor }}
            >
              {sideMeta.label}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight text-white">{pair}</span>
              <div className="flex flex-wrap items-center gap-1 text-xs text-[#A4A4A4]">
                <span>Order ID :</span>
                <button
                  type="button"
                  onClick={copyOrderIdToClipboard}
                  title={orderId}
                  aria-label={copyButtonAriaLabel}
                  className={`${copyButtonClasses} cursor-pointer`}
                >
                  <span className={TEXT_CONTAINER_CLASSES} style={textContainerStyle}>
                    <motion.span
                      initial={CLIP_VISIBLE}
                      animate={orderTextControls}
                      className={TEXT_LAYER_CLASSES}
                      style={TEXT_LAYER_STYLE}
                    >
                      {shortenedOrderId}
                    </motion.span>
                    <motion.span
                      initial={CLIP_HIDDEN}
                      animate={feedbackTextControls}
                      className={TEXT_LAYER_CLASSES}
                      style={TEXT_LAYER_STYLE}
                    >
                      {copyFeedback}
                    </motion.span>
                  </span>

                  <span style={VISUALLY_HIDDEN_STYLE} aria-live="polite">
                    {liveRegionMessage}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2 text-xs text-[#A4A4A4] sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1F2029] px-3 py-2">
            <span>{rightTopLabel}</span>
            <div className="flex items-baseline gap-2 text-white">
              <span className="font-normal leading-tight">{amount}</span>
              <span className="font-normal leading-tight">{baseSymbol}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg bg-[#1F2029] px-3 py-2">
            <span>Price</span>
            <div className="flex items-baseline gap-2 text-white">
              <span className="font-normal leading-tight">{price}</span>
              {currency ? <span className="font-normal leading-tight">{currency}</span> : null}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      className="w-[840px] h-[68px] p-3 bg-[#16171D] rounded-lg outline outline-offset-[-1px] flex items-center"
      style={{ outlineColor: '#474747' }}
    >
      <div className="w-full grid md:grid-cols-[104px_176px_76px_1fr_256px] grid-cols-[104px_176px_76px_1fr_256px] items-center gap-3">
        <div className="w-[104px] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusMeta.dotColor }} />
          <span
            className={`text-xs font-normal font-[Alexandria] leading-none ${
              status === 'complete' ? 'text-[#4ED7B0]' : 'text-[#A4A4A4]'
            }`}
          >
            {statusMeta.label}
          </span>
        </div>

        <div className="w-[176px] flex items-center gap-1.5 text-white text-xs font-medium font-[Alexandria] leading-none whitespace-nowrap">
          <span>{date}</span>
          <span>{time}</span>
        </div>

        <div className="w-[76px] flex items-center justify-center">
          <div
            className={`w-[47px] h-7 px-3 rounded-lg inline-flex -ml-12 justify-center items-center ${
              side === 'buy' ? 'bg-[#217871]' : 'bg-[#D84C4C]'
            }`}
          >
            <span className="text-white text-xs font-normal font-[Alexandria] leading-none">
              {sideMeta.label}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex flex-col justify-center items-start gap-1">
          <div className="text-white text-sm font-medium font-[Alexandria] leading-tight truncate">
            {pair}
          </div>
          <div className="inline-flex items-center gap-1 whitespace-nowrap">
            <span className="text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">
              Order ID :
            </span>
            <button
              type="button"
              onClick={copyOrderIdToClipboard}
              title={orderId}
              aria-label={copyButtonAriaLabel}
              className={`${copyButtonClasses} cursor-pointer`}
            >
              <span className={TEXT_CONTAINER_CLASSES} style={textContainerStyle}>
                <motion.span
                  initial={CLIP_VISIBLE}
                  animate={orderTextControls}
                  className={TEXT_LAYER_CLASSES}
                  style={TEXT_LAYER_STYLE}
                >
                  {shortenedOrderId}
                </motion.span>
                <motion.span
                  initial={CLIP_HIDDEN}
                  animate={feedbackTextControls}
                  className={TEXT_LAYER_CLASSES}
                  style={TEXT_LAYER_STYLE}
                >
                  {copyFeedback}
                </motion.span>
              </span>

              <span style={VISUALLY_HIDDEN_STYLE} aria-live="polite">
                {liveRegionMessage}
              </span>
            </button>
          </div>
        </div>

        <div className="w-[256px] self-stretch inline-flex flex-col justify-center items-start gap-1">
          <div className="self-stretch px-2 rounded-xl inline-flex justify-end items-center gap-2">
            <div className="w-14 text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">
              {rightTopLabel}
            </div>
            <div className="w-36 text-right text-white text-sm font-normal font-[Alexandria] leading-tight">
              {amount}
            </div>
            <div className="w-8 text-center text-white text-sm font-normal font-[Alexandria] leading-tight">
              {baseSymbol}
            </div>
          </div>
          <div className="self-stretch px-2 rounded-xl inline-flex justify-end items-center gap-2">
            <div className="w-12 text-[#A4A4A4] text-xs font-normal font-[Alexandria] leading-none">
              Price
            </div>
            <div className="w-40 text-right text-white text-sm font-normal font-[Alexandria] leading-tight">
              {price}
            </div>
            <div className="w-8 text-center text-white text-sm font-normal font-[Alexandria] leading-tight">
              {currency}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

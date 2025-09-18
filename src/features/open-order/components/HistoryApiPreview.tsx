'use client';

import React from 'react';
import axiosInstance from '@/lib/axios';
import type { GetTradeHistoryResponseApi, TradeHistoryRange } from '../types/history';

const DEFAULT_PARAMS: { range: TradeHistoryRange; limit: number; page: number } = {
  range: 'all',
  limit: 10,
  page: 1,
};

const HISTORY_ENDPOINT = '/history';
const HISTORY_PROXY_ENDPOINT = '/api/history';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export default function HistoryApiPreview() {
  const [status, setStatus] = React.useState<FetchStatus>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<GetTradeHistoryResponseApi | null>(null);

  const fetchHistory = React.useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const hasBaseUrl = Boolean(axiosInstance.defaults.baseURL);
      const url = hasBaseUrl ? HISTORY_ENDPOINT : HISTORY_PROXY_ENDPOINT;
      const { data } = await axiosInstance.get<GetTradeHistoryResponseApi>(url, {
        params: DEFAULT_PARAMS,
      });
      setPayload(data);
      setStatus('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#2F2F2F] bg-[#16171D] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">Trade history API payload</h3>
        <button
          type="button"
          onClick={fetchHistory}
          className="rounded-lg border border-[#474747] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#E9E9E9]"
        >
          Reload
        </button>
      </div>

      <div className="text-xs text-[#A4A4A4]">
        range: <span className="text-white">{DEFAULT_PARAMS.range}</span> | limit:{' '}
        <span className="text-white">{DEFAULT_PARAMS.limit}</span> | page:{' '}
        <span className="text-white">{DEFAULT_PARAMS.page}</span>
      </div>

      {status === 'loading' ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : status === 'error' ? (
        <div className="text-sm text-[#FF6B6B]">Failed to load data{error ? `: ${error}` : ''}</div>
      ) : payload ? (
        <pre className="max-h-96 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-[#E9E9E9]">
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : (
        <div className="text-sm text-[#A4A4A4]">No data returned</div>
      )}
    </div>
  );
}

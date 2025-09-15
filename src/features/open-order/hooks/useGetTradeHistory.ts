"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  GetTradeHistoryRequest,
  GetTradeHistoryResponse,
  TradeHistoryItemApi,
} from "../types/history";

type Options = GetTradeHistoryRequest & {
  mock?: boolean; // use mocked data instead of calling API
  enabled?: boolean;
};

async function fetchTradeHistory(params: GetTradeHistoryRequest): Promise<GetTradeHistoryResponse> {
  const { data } = await axios.get<GetTradeHistoryResponse>("/api/trade-history", { params });
  return data;
}

function buildMock(params: GetTradeHistoryRequest): GetTradeHistoryResponse {
  const now = new Date();
  const iso = now.toISOString();
  const items: TradeHistoryItemApi[] = [
    {
      id: "demo-1",
      orderRef: "88cbe33fabcd0da4e39",
      side: "BUY",
      symbol: "BTC",
      baseSymbol: "BTC",
      quoteSymbol: "USDT",
      matchedAmount: 0.02,
      price: 115200,
      currency: "USD",
      status: "CLOSED",
      createdAt: iso,
    },
    {
      id: "demo-2",
      orderRef: "11dbe33fabcd0da9a11",
      side: "BUY",
      symbol: "BTC",
      baseSymbol: "BTC",
      quoteSymbol: "USDT",
      matchedAmount: 0.02,
      price: 115200,
      currency: "USD",
      status: "COMPLETE",
      createdAt: iso,
    },
  ];
  return {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    total: items.length,
    totalPages: 1,
    items,
  };
}

export function useGetTradeHistory({ mock = false, enabled = true, ...params }: Options) {
  return useQuery({
    queryKey: ["trade-history", params],
    enabled,
    queryFn: async () => (mock ? buildMock(params) : fetchTradeHistory(params)),
    staleTime: 5_000,
  });
}


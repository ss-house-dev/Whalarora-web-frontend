"use client";

import { useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAssets } from "../services/getAssets";
import { buildHoldingRows } from "../services/buildHoldingRows";
import { useBinanceTicker } from "./useBinanceTicker";
import type { HoldingRow } from "../types";

export function useHoldingRows() {
  // 1) ดึงสินทรัพย์ที่ผู้ใช้ถือ (คงค่าเดิมไว้ระหว่าง refetch)
  const assetsQ = useQuery({
    queryKey: ["trade-assets"],
    queryFn: getAssets,
    staleTime: 60_000,                 // ข้อมูลไม่ stale ภายใน 1 นาที
    gcTime: 30 * 60 * 1000,            // เก็บ cache 30 นาที (กลับหน้าไปมาไม่กระพริบ)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    placeholderData: keepPreviousData, // v5: แทน keepPreviousData เดิม
  });

  // 2) สร้างรายการสัญลักษณ์ที่ต้องติดตาม (ตัด CASH ออก)
  const symbols = useMemo(
    () =>
      (assetsQ.data ?? [])
        .map((a) => a.symbol)
        .filter((s): s is string => !!s && s !== "CASH"),
    [assetsQ.data]
  );

  // 3) ราคาสดจาก Binance (มี snapshot + WS auto update)
  const ticker = useBinanceTicker(symbols);

  // 4) รวมข้อมูลออกเป็นแถวของตาราง
  const rows = useMemo<HoldingRow[] | undefined>(() => {
    if (!assetsQ.data) return undefined;
    return buildHoldingRows(assetsQ.data, ticker.data);
  }, [assetsQ.data, ticker.data]); // ต้องมี ticker.data เพื่อให้ราคาวิ่งทันที

  // แสดง loading แค่รอบแรกจริง ๆ
  const isLoading = !assetsQ.data && (assetsQ.isLoading || ticker.isLoading);
  const isError = assetsQ.isError;

  return {
    data: rows,
    isLoading,
    isError,
    refetch: () => assetsQ.refetch(),
  };
}

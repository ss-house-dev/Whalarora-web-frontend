import { axiosNext } from '@/lib/axios';
import { getSession } from 'next-auth/react';
import type { ApiAsset } from '../types';

export async function getAssets(): Promise<ApiAsset[]> {
  const session = await getSession();
  const t = session?.accessToken ?? ''; // ต้องไม่ว่างหลังล็อกอิน
  const headers = t ? { Authorization: `Bearer ${t}` } : {};
  const { data } = await axiosNext.get<ApiAsset[]>('/trade/assets', { headers });
  return data;
}

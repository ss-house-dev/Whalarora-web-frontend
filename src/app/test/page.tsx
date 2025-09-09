'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SymbolInfo } from '@/types/symbol-types';

interface USDTPair {
  symbol: string;
  baseAsset: string;
  iconUrl?: string;
}

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

const BinanceUSDTPairs: React.FC = () => {
  const [pairs, setPairs] = useState<USDTPair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [coinIcons, setCoinIcons] = useState<Map<string, string>>(new Map());

  // ฟังก์ชันดึงไอคอนจาก CoinGecko
  const fetchCoinIcons = useCallback(async (symbols: string[]) => {
    try {
      // CoinGecko API มีข้อจำกัดในการเรียกครั้งเดียว เลยต้องแบ่งเป็น batch
      const batchSize = 50;
      const iconMap = new Map<string, string>();

      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const symbolsQuery = batch.join(',').toLowerCase();

        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbolsQuery}&order=market_cap_desc&per_page=${batchSize}&page=1&sparkline=false`
          );

          if (response.ok) {
            const data: CoinGeckoResponse[] = await response.json();
            data.forEach((coin) => {
              iconMap.set(coin.symbol.toUpperCase(), coin.image);
            });
          }
        } catch (error) {
          console.warn(`Error fetching batch ${i}-${i + batchSize}:`, error);
        }

        // หน่วงเวลาเพื่อไม่ให้เกิน rate limit
        if (i + batchSize < symbols.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      setCoinIcons(iconMap);
    } catch (error) {
      console.error('Error fetching coin icons:', error);
    }
  }, []);

  const fetchUSDTPairs = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const data = await response.json();

      const usdtPairs: USDTPair[] = (data.symbols as SymbolInfo[])
        .filter((symbol) => symbol.quoteAsset === 'USDT' && symbol.status === 'TRADING')
        .map((symbol) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
        }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));

      setPairs(usdtPairs);

      // ดึงไอคอนของเหรียญทั้งหมด
      const uniqueSymbols = [...new Set(usdtPairs.map((pair) => pair.baseAsset))];
      await fetchCoinIcons(uniqueSymbols);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchCoinIcons]);

  useEffect(() => {
    fetchUSDTPairs();
  }, [fetchUSDTPairs]);

  const filteredPairs = pairs.filter(
    (pair) =>
      pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.baseAsset.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Binance USDT Pairs</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="ค้นหาเหรียญ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={fetchUSDTPairs}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
        </button>
      </div>

      <div className="mb-2">
        <span>จำนวน: {filteredPairs.length} คู่</span>
      </div>

      <div className="border rounded">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left text-black">Icon</th>
              <th className="p-2 text-left text-black">Symbol</th>
              <th className="p-2 text-left text-black">Base Asset</th>
            </tr>
          </thead>
          <tbody>
            {filteredPairs.map((pair, index) => (
              <tr key={pair.symbol} className="border-t hover:bg-gray-500 hover:text-white">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  {coinIcons.get(pair.baseAsset) ? (
                    <Image
                      src={coinIcons.get(pair.baseAsset) || ''}
                      alt={`${pair.baseAsset} icon`}
                      width={24}
                      height={24}
                      className="rounded-full"
                      unoptimized
                      onError={(e) => {
                        // แสดงตัวอักษรแรกถ้าโหลดรูปไม่ได้
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLDivElement;
                        if (fallback) {
                          fallback.classList.remove('hidden');
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                      {pair.baseAsset.charAt(0)}
                    </div>
                  )}
                  {/* Fallback สำหรับกรณีโหลดรูปไม่ได้ */}
                  <div className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center text-xs font-bold text-gray-600 hidden">
                    {pair.baseAsset.charAt(0)}
                  </div>
                </td>
                <td className="p-2 font-mono">{pair.symbol}</td>
                <td className="p-2">{pair.baseAsset}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            กำลังดึงข้อมูลและไอคอน...
          </div>
        </div>
      )}
    </div>
  );
};

export default BinanceUSDTPairs;

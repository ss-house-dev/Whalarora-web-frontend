"use client";
import React, { useState, useEffect } from "react";
import { SymbolInfo } from "@/types/symbol-types";

interface USDTPair {
  symbol: string;
  baseAsset: string;
}

const BinanceUSDTPairs: React.FC = () => {
  const [pairs, setPairs] = useState<USDTPair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchUSDTPairs = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "https://api.binance.com/api/v3/exchangeInfo"
      );
      const data = await response.json();

      const usdtPairs: USDTPair[] = (data.symbols as SymbolInfo[])
        .filter(
          (symbol) =>
            symbol.quoteAsset === "USDT" && symbol.status === "TRADING"
        )
        .map((symbol) => ({
          symbol: symbol.symbol,
          baseAsset: symbol.baseAsset,
        }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));

      setPairs(usdtPairs);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUSDTPairs();
  }, []);

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
          {loading ? "กำลังโหลด..." : "รีเฟรช"}
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
              <th className="p-2 text-left text-black">Symbol</th>
              <th className="p-2 text-left text-black">Base Asset</th>
            </tr>
          </thead>
          <tbody>
            {filteredPairs.map((pair, index) => (
              <tr key={pair.symbol} className="border-t">
                <td className="p-2">{index + 1}</td>
                <td className="p-2 font-mono">{pair.symbol}</td>
                <td className="p-2">{pair.baseAsset}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BinanceUSDTPairs;

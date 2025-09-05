'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Coin {
  value: string; // e.g., "BINANCE:BTCUSDT"
  label: string; // e.g., "BTC/USDT"
  icon: React.ReactNode; // สำหรับไอคอนหลัก
  popoverIcon: React.ReactNode; // สำหรับไอคอนใน popover
}

interface CoinContextType {
  selectedCoin: Coin;
  setSelectedCoin: (coin: Coin) => void;
  marketPrice: string;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export const CoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCoin, setSelectedCoin] = useState<Coin>({
    value: 'BINANCE:BTCUSDT',
    label: 'BTC/USDT',
    icon: (
      <Image
        src="/currency-icons/bitcoin-icon.svg"
        alt="Bitcoin"
        width={28}
        height={28}
        className="rounded-full"
      />
    ),
    popoverIcon: (
      <Image
        src="/currency-icons/bitcoin-icon.svg"
        alt="Bitcoin"
        width={20}
        height={20}
        className="rounded-full"
      />
    ),
  });
  const [marketPrice, setMarketPrice] = useState<string>('');

  const fetchMarketPrice = useCallback(async () => {
    try {
      const symbol = selectedCoin.value.replace('BINANCE:', '');
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      const price = parseFloat(data.price).toFixed(2);
      setMarketPrice(price);
    } catch (error) {
      console.error('Error fetching market price:', error);
      setMarketPrice('');
    }
  }, [selectedCoin]);

  useEffect(() => {
    fetchMarketPrice();
    const interval = setInterval(fetchMarketPrice, 5000); // อัปเดตทุก 5 วินาที
    return () => clearInterval(interval);
  }, [fetchMarketPrice]);

  return (
    <CoinContext.Provider value={{ selectedCoin, setSelectedCoin, marketPrice }}>
      {children}
    </CoinContext.Provider>
  );
};

export const useCoinContext = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoinContext must be used within a CoinProvider');
  }
  return context;
};

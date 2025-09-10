'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react'; // เพิ่ม import

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

const defaultCoin: Coin = {
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
};

export const CoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCoin, setSelectedCoinState] = useState<Coin>(defaultCoin);
  const [marketPrice, setMarketPrice] = useState<string>('');
  const { data: session, status } = useSession(); // เพิ่ม useSession

  // Load from localStorage on mount (เฉพาะเมื่อ authenticated)
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        // ถ้าไม่ได้ login ให้ใช้ BTC default เสมอ
        if (status === 'unauthenticated' || !session) {
          console.log('🟢 Not authenticated, using BTC default');
          setSelectedCoinState(defaultCoin);
          // Clear localStorage เพื่อไม่ให้มี data เก่าค้างอยู่
          localStorage.removeItem('selectedCoin');
          return;
        }

        // ถ้า login แล้วให้ load จาก localStorage หรือใช้ BTC default
        if (status === 'authenticated') {
          const stored = localStorage.getItem('selectedCoin');
          if (stored) {
            const storedData = JSON.parse(stored);
            console.log('🟢 Loaded from localStorage:', storedData);

            // สร้าง coin object จาก stored data
            if (storedData.symbol) {
              const coinObject = createCoinObject(storedData.symbol);
              setSelectedCoinState(coinObject);
              console.log('🟢 Set coin from localStorage:', coinObject.label);
            } else {
              console.log('🟢 No valid stored data, using BTC default');
              setSelectedCoinState(defaultCoin);
            }
          } else {
            console.log('🟢 No stored data, using BTC default for authenticated user');
            setSelectedCoinState(defaultCoin);
          }
        }
      } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        setSelectedCoinState(defaultCoin);
      }
    };

    // เรียกใช้เมื่อ session status เปลี่ยน
    if (status !== 'loading') {
      loadFromStorage();
    }
  }, [session, status]); // เพิ่ม dependency

  // Enhanced setSelectedCoin with localStorage backup
  const setSelectedCoin = useCallback(
    (coin: Coin) => {
      console.log('🟢 CoinContext setSelectedCoin called with:', coin.label);

      try {
        setSelectedCoinState(coin);

        // Save to localStorage เฉพาะเมื่อ login
        if (session) {
          const symbol = coin.value.replace('BINANCE:', '').replace('USDT', '');
          localStorage.setItem(
            'selectedCoin',
            JSON.stringify({
              value: coin.value,
              label: coin.label,
              symbol: symbol,
            })
          );
          console.log('🟢 Saved to localStorage for authenticated user');
        } else {
          console.log('🟢 Not saving to localStorage (not authenticated)');
        }

        console.log('🟢 Successfully updated selectedCoin to:', coin.label);
      } catch (error) {
        console.error('❌ Error in setSelectedCoin:', error);
      }
    },
    [session]
  );

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
    const interval = setInterval(fetchMarketPrice, 5000);
    return () => clearInterval(interval);
  }, [fetchMarketPrice]);

  return (
    <CoinContext.Provider value={{ selectedCoin, setSelectedCoin, marketPrice }}>
      {children}
    </CoinContext.Provider>
  );
};

// Helper function ใน context (copy จาก AssetCard)
const createCoinObject = (symbol: string): Coin => {
  const upperSymbol = symbol.toUpperCase();

  const getIcon = (sym: string, size: number = 28) => {
    const iconProps = {
      width: size,
      height: size,
      className: 'rounded-full',
    };

    switch (sym) {
      case 'BTC':
        return <Image src="/currency-icons/bitcoin-icon.svg" alt="Bitcoin" {...iconProps} />;
      case 'ETH':
        return <Image src="/currency-icons/ethereum-icon.svg" alt="Ethereum" {...iconProps} />;
      case 'BNB':
        return <Image src="/currency-icons/bnb-coin.svg" alt="BNB" {...iconProps} />;
      case 'SOL':
        return <Image src="/currency-icons/solana-icon.svg" alt="Solana" {...iconProps} />;
      case 'XRP':
        return <Image src="/currency-icons/xrp-coin.svg" alt="XRP" {...iconProps} />;
      case 'ADA':
        return <Image src="/currency-icons/ada-coin.svg" alt="Cardano" {...iconProps} />;
      case 'DOGE':
        return <Image src="/currency-icons/doge-coin.svg" alt="Dogecoin" {...iconProps} />;
      default:
        return <Image src="/currency-icons/default-coin.svg" alt="Default Coin" {...iconProps} />;
    }
  };

  return {
    value: `BINANCE:${upperSymbol}USDT`,
    label: `${upperSymbol}/USDT`,
    icon: getIcon(upperSymbol, 28),
    popoverIcon: getIcon(upperSymbol, 20),
  };
};

export const useCoinContext = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoinContext must be used within a CoinProvider');
  }
  return context;
};

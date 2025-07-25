"use client";

import { useState } from "react";
import { useBalance } from "@/components/contexts/BalanceContext";
import { useCryptoPrice } from '@/hooks/useCryptoPrice'

// Type สำหรับประวัติการซื้อขาย
interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  amount: number;
  price: number;
  total: number;
  timestamp: Date;
}

export default function OrderBox({ mainSymbol = "BTC" }: { mainSymbol?: string }) {
  const [tab, setTab] = useState<"limit" | "market" | "stop">("limit");
  const [buyAmount, setBuyAmount] = useState(0);
  const [sellAmount, setSellAmount] = useState(0);
  const [buyAttempted, setBuyAttempted] = useState(false);
  const [sellAttempted, setSellAttempted] = useState(false);
  
  // เพิ่ม state สำหรับเก็บจำนวนเหรียญที่ถือ
  const [coinBalance, setCoinBalance] = useState(0.00);
  
  // เพิ่ม state สำหรับเก็บประวัติการซื้อขาย
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { balance, setBalance } = useBalance();

  // --- ดึงราคาจาก API ---
  const symbol = mainSymbol.endsWith("USDT") ? mainSymbol : mainSymbol + "USDT";
  const { data, loading, error } = useCryptoPrice(symbol);

  const bidPrice =
    !data || error
      ? 0
      : parseFloat(data.price || data.lastPrice || "0");

  const askPrice = bidPrice;

  const buyTotal = (buyAmount * bidPrice).toFixed(4);
  const sellTotal = (sellAmount * askPrice).toFixed(4);

  const isBuyAmountValid = buyAmount > 0 && (buyAmount * bidPrice) <= balance;
  const isSellAmountValid = sellAmount > 0 && sellAmount <= coinBalance;

  // Validation สำหรับ Buy
  const isBuyAmountEmpty = buyAmount <= 0;
  const isBuyAmountOver = (buyAmount * bidPrice) > balance;
  const isBuyAmountError = isBuyAmountEmpty || isBuyAmountOver;

  // Validation สำหรับ Sell
  const isSellAmountEmpty = sellAmount <= 0;
  const isSellAmountOver = sellAmount > coinBalance;
  const isSellAmountError = isSellAmountEmpty || isSellAmountOver;

  const isBidPriceValid = bidPrice > 0;
  const isAskPriceValid = askPrice > 0;
  const isBuyDisabled = !isBidPriceValid || buyAmount <= 0 || (buyAmount * bidPrice) > balance;
  const isSellDisabled = !isAskPriceValid || sellAmount <= 0 || sellAmount > coinBalance;

  // เพิ่มเงื่อนไขสำหรับแสดงกรอบแดงเมื่อราคาเป็น 0
  const shouldShowBuyRedBorder = (buyAttempted && isBuyAmountError) || (!isBidPriceValid && buyAttempted);
  const shouldShowSellRedBorder = (sellAttempted && isSellAmountError) || (!isAskPriceValid && sellAttempted);

  // ฟังก์ชันสำหรับสร้าง transaction ID
  const generateTransactionId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // ฟังก์ชันสำหรับจัดการการซื้อ
  const handleBuy = () => {
    setBuyAttempted(true);
    
    if (buyAmount > 0 && (buyAmount * bidPrice) <= balance && bidPrice > 0) {
      const totalCost = buyAmount * bidPrice;
      
      // สร้างประวัติการซื้อ
      const newTransaction: Transaction = {
        id: generateTransactionId(),
        type: 'buy',
        symbol: extractBaseSymbol(mainSymbol),
        amount: buyAmount,
        price: bidPrice,
        total: totalCost,
        timestamp: new Date()
      };
      
      // เพิ่มประวัติใหม่เข้าไปในรายการ (ใหม่สุดอยู่บนสุด)
      setTransactions(prev => [newTransaction, ...prev]);
      
      // อัพเดท balance (ลดเงิน USDT)
      setBalance(balance - totalCost);
      
      // อัพเดทจำนวนเหรียญที่ถือ (เพิ่มเหรียญ)
      setCoinBalance(coinBalance + buyAmount);
      
      // รีเซ็ตค่า
      setBuyAmount(0);
      setBuyAttempted(false);
      
      alert(`Successfully bought ${buyAmount} ${mainSymbol} for ${totalCost.toFixed(4)} USDT`);
    }
  };

  // ฟังก์ชันสำหรับจัดการการขาย
  const handleSell = () => {
    setSellAttempted(true);
    
    if (sellAmount > 0 && sellAmount <= coinBalance && askPrice > 0) {
      const totalReceived = sellAmount * askPrice;
      
      // สร้างประวัติการขาย
      const newTransaction: Transaction = {
        id: generateTransactionId(),
        type: 'sell',
        symbol: extractBaseSymbol(mainSymbol),
        amount: sellAmount,
        price: askPrice,
        total: totalReceived,
        timestamp: new Date()
      };
      
      // เพิ่มประวัติใหม่เข้าไปในรายการ (ใหม่สุดอยู่บนสุด)
      setTransactions(prev => [newTransaction, ...prev]);
      
      // อัพเดท balance (เพิ่มเงิน USDT)
      setBalance(balance + totalReceived);
      
      // อัพเดทจำนวนเหรียญที่ถือ (ลดเหรียญ)
      setCoinBalance(coinBalance - sellAmount);
      
      // รีเซ็ตค่า
      setSellAmount(0);
      setSellAttempted(false);
      
      alert(`Successfully sold ${sellAmount} ${mainSymbol} for ${totalReceived.toFixed(4)} USDT`);
    }
  };

  // ฟังก์ชันช่วยสำหรับแยกชื่อเหรียญ (เช่น BTC, ETH) จากสัญลักษณ์
  // เช่น "BINANCE:BTCUSDT" จะได้ "BTC"
  function extractBaseSymbol(symbol?: string) {
    if (!symbol) return "";
    if (symbol.includes(":")) symbol = symbol.split(":")[1];
    if (symbol.includes("/")) return symbol.split("/")[0];
    return symbol.substring(0, 3).toUpperCase();
  }

  // ตัวช่วยสำหรับแสดงราคา (รองรับ loading/error)
  const displayPrice = () => {
    if (loading) return "Loading...";
    if (error) return "Error";
    return bidPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ฟังก์ชันสำหรับ format วันที่และเวลา
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="absolute -top-10 left-0 mt-7 w-[325px] z-10">
        <div className="bg-white rounded-t-xl rounded-b-none px-2 py-3 flex justify-center space-x-3 w-full">
          {["limit", "market", "stop"].map((type) => (
            <button
              key={type}
              className={`px-2 py-2 rounded-md text-sm font-medium transition ${tab === type ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              onClick={() => setTab(type as any)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} order
            </button>
          ))}
        </div>
      </div>

      <div className="absolute -top-10 left-0 mt-7 w-[325px] h-[56px] pointer-events-none rounded-xl z-0" style={{ background: "transparent", boxShadow: "0 0 12px 4px #3b82f680, 0 2px 12px #60a5fa55" }} />

      <div className="mt-8 p-4 md:p-6 rounded-xl shadow-xl bg-white z-5 relative" style={{ boxShadow: "0 0 12px 4px #3b82f680, 0 2px 12px #60a5fa55" }}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{balance.toLocaleString()} USD</span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Bid price</span>
              <span className="font-semibold text-lg text-gray-800">
                {error ? "Error" : bidPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
              </span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-white">
              <span className="text-sm text-gray-400 flex-1">Amount</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={buyAmount}
                onChange={(e) => setBuyAmount(Number(e.target.value))}
                className="flex-1 bg-transparent border-none outline-none text-gray-500 focus:ring-0 text-right"
              />
              <span className="text-sm text-gray-400 ml-2">{extractBaseSymbol(mainSymbol)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="border text-sm text-gray-600 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => {
                    if (bidPrice > 0) {
                      setBuyAmount((pct / 100) * (balance / bidPrice));
                    }
                  }}
                >
                  {pct} %
                </button>
              ))}
            </div>

            {/* เพิ่ม label Total ให้เหมือนฝั่ง Sell */}
            <div className="text-sm text-gray-500">Total</div>

            <div className={
              "flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50 box-border" +
              (shouldShowBuyRedBorder ? " border-2 border-red-400" : "")
            }>
              <span className="text-gray-400">{loading ? "-" : parseFloat(buyTotal).toFixed(4)}</span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>

            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              {buyAttempted && (isBuyAmountError || !isBidPriceValid) ? (
                <span className="text-red-500">
                  {!isBidPriceValid ? "Price not available" : 
                   isBuyAmountEmpty ? "Please enter the amount" : "Your balance is insufficient"}
                </span>
              ) : (
                <>≈ {parseFloat(buyTotal).toFixed(4)} USD</>
              )}
            </div>

            <button
              className="w-full py-2 bg-green-600 text-white rounded-md font-semibold transition hover:bg-green-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleBuy}
            >
              Buy
            </button>
          </div>
        
          <div className="space-y-4 border rounded-md p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>My balance</span>
              <span>{coinBalance.toFixed(4)} {extractBaseSymbol(mainSymbol)}</span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-gray-50">
              <span className="text-sm text-gray-400 flex-1">Ask price</span>
              <span className="font-semibold text-lg text-gray-800">
                {error ? "Error" : askPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
              </span>
            </div>

            <div className="flex items-center border px-4 py-2 rounded-md bg-white">
              <span className="text-sm text-gray-400 flex-1">Amount</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(Number(e.target.value))}
                className="flex-1 bg-transparent border-none outline-none text-gray-500 focus:ring-0 text-right"
              />
              <span className="text-sm text-gray-400 ml-2">{extractBaseSymbol(mainSymbol)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="border text-sm text-gray-600 py-1 rounded-md hover:bg-gray-100"
                  onClick={() => setSellAmount((pct / 100) * coinBalance)}
                >
                  {pct} %
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">Total</div>
            <div className={
              "flex items-center justify-between border px-4 py-2 rounded-md bg-gray-50 box-border" +
              (shouldShowSellRedBorder ? " border-2 border-red-400" : "")
            }>
              <span className="text-gray-400">{loading ? "-" : parseFloat(sellTotal).toFixed(4)}</span>
              <span className="text-sm text-gray-400">USDT</span>
            </div>

            <div className="text-right text-xs text-gray-400 min-h-[20px]">
              {sellAttempted && (isSellAmountError || !isAskPriceValid) ? (
                <span className="text-red-500">
                  {!isAskPriceValid ? "Price not available" : 
                   isSellAmountEmpty ? "Please enter the amount" : "Your balance is insufficient"}
                </span>
              ) : (
                <>≈ {parseFloat(sellTotal).toFixed(4)} USD</>
              )}
            </div>

            <button
              className="w-full py-2 bg-red-600 text-white rounded-md font-semibold transition hover:bg-red-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSell}
            >
              Sell
            </button>
          </div>
        </div>

        {/* ปุ่มสำหรับแสดง/ซ่อนประวัติ */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition flex items-center gap-2"
          >
            {showHistory ? '🔼' : '🔽'} Transaction History ({transactions.length})
          </button>
        </div>

        {/* ส่วนแสดงประวัติการซื้อขาย */}
        {showHistory && (
          <div className="mt-6 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-800">Transaction History</h3>
            </div>
            
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No transactions yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(transaction.timestamp)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.type === 'buy' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.symbol}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {transaction.amount.toFixed(4)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {transaction.price.toLocaleString(undefined, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} USDT
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {transaction.total.toFixed(4)} USDT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
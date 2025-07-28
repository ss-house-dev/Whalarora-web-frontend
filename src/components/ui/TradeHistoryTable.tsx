import React, { useState } from "react";

export interface Transaction {
    id: string;
    type: 'buy' | 'sell';
    symbol: string;
    amount: number;
    price: number;
    total: number;
    timestamp: Date;
}

interface Props {
    transactions: Transaction[];
}

const TradeHistoryTable = ({ transactions }: Props) => {
    const [activeTab, setActiveTab] = useState("Trade History");
    const [activePeriod, setActivePeriod] = useState("Year");

    const tabs = ["Unrealized P&L", "Open Orders", "Order History", "Trade History"];
    const periods = ["Day", "Month", "Year"];

    const unrealized = [
        { symbol: "BTC/USDT", cost: "119556.867", shares: "0.002", total: "240.00", current: "118,616.53", value: "237.23306", pnl: "-2.15% (-2.767)" },
        { symbol: "XRP/USDT", cost: "3.410", shares: "52.450", total: "178.97", current: "3.52065", value: "184.65800", pnl: "+3.23% (+5.781)" },
    ];

    const isTradeLike = ["Trade History", "Open Orders", "Order History"].includes(activeTab);
    const isTradeTab = tabs.includes(activeTab);

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
        <div className="w-full max-w-[1240px] mx-auto mt-10 rounded-xl overflow-hidden border border-blue-200">
            {/* Tab Header */}
            <div className="relative bg-gradient-to-r from-[#1F4293] via-[#8A38F5] to-[#26F6BA] px-6 pt-2 pb-0 rounded-t-xl">
                <div className="flex items-end space-x-2 relative">
                    <div
                        className={`absolute transition-all duration-300 ease-in-out bg-white rounded-t-xl z-0 ${isTradeTab ? "default-highlight" : "unrealized-highlight"}`}
                        style={{ height: "100%", width: "8rem", transform: `translateX(${tabs.indexOf(activeTab) * 8.5}rem)` }}
                    />
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative z-10 px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === tab ? "text-[#1F4293]" : "text-white hover:text-white/90"}`}
                            style={{ height: "100%", width: "8rem" }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {isTradeLike && (
                <div className="flex gap-3 px-6 py-4 bg-white">
                    {periods.map((period) => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={`px-4 py-1 rounded-full text-sm font-medium shadow ${activePeriod === period
                                ? "bg-blue-900 text-white"
                                : "bg-white text-blue-900 border border-blue-300 hover:bg-gray-100"}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            )}

            <div className="bg-white">
                {isTradeLike ? (
                    <div className="grid grid-cols-8 gap-4 px-6 py-2 text-xs text-gray-500 font-semibold">
                        <div>Date</div>
                        <div>Time</div>
                        <div>Symbol</div>
                        <div>Side</div>
                        <div>Price</div>
                        <div>Amount</div>
                        <div>Fee (USD)</div>
                        <div>Total (USD)</div>
                    </div>
                ) : activeTab === "Unrealized P&L" ? (
                    <div className="grid grid-cols-7 gap-4 px-6 py-2 text-xs text-gray-500 font-semibold">
                        <div>Symbol</div>
                        <div>Cost per Share (USD)</div>
                        <div>Outstanding Shares</div>
                        <div>Total Cost (USD)</div>
                        <div>Current Price (USD)</div>
                        <div>Holding Value (USD)</div>
                        <div>Unrealized P&L (USD)</div>
                    </div>
                ) : null}
            </div>

            <div className="bg-white">
                {isTradeLike &&
                    transactions.map((tx, idx) => (
                        <div
                            key={tx.id}
                            className={`grid grid-cols-8 gap-4 px-6 py-3 text-sm ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                        >
                            <div>{formatDateTime(tx.timestamp).split(' ')[0]}</div>
                            <div>{formatDateTime(tx.timestamp).split(' ')[1]}</div>
                            <div>{tx.symbol}/USDT</div>
                            <div className="text-emerald-500 font-medium">{tx.type.toUpperCase()}</div>
                            <div>{tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div>{tx.amount.toFixed(8)}</div>
                            <div>0.00000000</div>
                            <div className="text-right">{tx.total.toFixed(2)}</div>
                        </div>
                    ))}

                {activeTab === "Unrealized P&L" &&
                    unrealized.map((row, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-7 gap-4 px-6 py-3 text-sm ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                        >
                            <div>{row.symbol}</div>
                            <div>{row.cost}</div>
                            <div>{row.shares}</div>
                            <div>{row.total}</div>
                            <div>{row.current}</div>
                            <div>{row.value}</div>
                            <div className={row.pnl.startsWith("-") ? "text-red-500" : "text-emerald-500"}>{row.pnl}</div>
                        </div>
                    ))}
            </div>

            {activeTab === "Unrealized P&L" && (
                <div className="bg-gray-100 px-6 py-3 flex justify-between items-center text-sm font-semibold">
                    <div className="text-gray-700">Total unrealized P&L</div>
                    <div className="text-emerald-500">+0.719% (+3.014)</div>
                </div>
            )}

            <div className="bg-stone-200/50 h-8 flex justify-center items-center rounded-b-xl">
                <div className="w-6 h-6 flex items-center justify-center text-blue-900 text-xl">▼</div>
            </div>
        </div>
    );
};

export default TradeHistoryTable;

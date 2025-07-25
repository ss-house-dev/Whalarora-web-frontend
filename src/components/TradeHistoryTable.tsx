import React, { useState } from "react";

const TradeHistoryTable = () => {
    const [activeTab, setActiveTab] = useState("Trade History");
    const [activePeriod, setActivePeriod] = useState("Year");

    const tabs = ["Unrealized P&L", "Open Orders", "Order History", "Trade History"];
    const periods = ["Day", "Month", "Year"];

    const trades = [
        { date: "07.18.25", time: "11:50:10", symbol: "BTC/USDT", side: "BUY", price: "118,616.53", amount: "0.00101000", fee: "0.00000000", total: "120" },
        { date: "05.15.25", time: "10:45:12", symbol: "BTC/USDT", side: "BUY", price: "120,516.20", amount: "0.00099000", fee: "0.00000000", total: "120" },
        { date: "05.12.25", time: "10:02:23", symbol: "XRP/USDT", side: "BUY", price: "3.41042000", amount: "52.45000000", fee: "0.00000000", total: "178.97" },
    ];

    const unrealized = [
        { symbol: "BTC/USDT", cost: "119556.867", shares: "0.002", total: "240.00", current: "118,616.53", value: "237.23306", pnl: "-2.15% (-2.767)" },
        { symbol: "XRP/USDT", cost: "3.410", shares: "52.450", total: "178.97", current: "3.52065", value: "184.65800", pnl: "+3.23% (+5.781)" },
    ];

    const isTradeLike = ["Trade History", "Open Orders", "Order History"].includes(activeTab);
    const isTradeTab = ["Trade History", "Open Orders", "Order History", "Unrealized P&L"].includes(activeTab);

    return (
        <div className="w-full max-w-[1240px] mx-auto mt-10 rounded-xl overflow-hidden border border-blue-200">
            {/* Tab Header */}
            <div className="relative bg-gradient-to-r from-[#1F4293] via-[#8A38F5] to-[#26F6BA] px-6 pt-2 pb-0 rounded-t-xl">
                <div className="flex items-end space-x-2 relative">
                    <div
                        className={`absolute transition-all duration-300 ease-in-out bg-white rounded-t-xl z-0 ${isTradeTab ? "default-highlight" : "unrealized-highlight"
                            }`}
                        style={{ height: "100%", width: "8rem", transform: `translateX(${tabs.indexOf(activeTab) * 8.5}rem)` }}
                    />
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative z-10 px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeTab === tab ? "text-[#1F4293]" : "text-white hover:text-white/90"
                                }`}
                            style={{ height: "100%", width: "8rem" }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Buttons (Only for Trade-like tabs) */}
            {isTradeLike && (
                <div className="flex gap-3 px-6 py-4 bg-white">
                    {periods.map((period) => (
                        <button
                            key={period}
                            onClick={() => setActivePeriod(period)}
                            className={`px-4 py-1 rounded-full text-sm font-medium shadow ${activePeriod === period
                                ? "bg-blue-900 text-white"
                                : "bg-white text-blue-900 border border-blue-300 hover:bg-gray-100"
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            )}

            {/* Table Header */}
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

            {/* Table Rows */}
            <div className="bg-white">
                {isTradeLike &&
                    trades.map((trade, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-8 gap-4 px-6 py-3 text-sm ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
                        >
                            <div>{trade.date}</div>
                            <div>{trade.time}</div>
                            <div>{trade.symbol}</div>
                            <div className="text-emerald-500 font-medium">{trade.side}</div>
                            <div>{trade.price}</div>
                            <div>{trade.amount}</div>
                            <div>{trade.fee}</div>
                            <div className="text-right">{trade.total}</div>
                        </div>
                    ))}

                {activeTab === "Unrealized P&L" &&
                    unrealized.map((row, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-7 gap-4 px-6 py-3 text-sm ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                }`}
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

            {/* Total Unrealized P&L (only for Unrealized tab) */}
            {activeTab === "Unrealized P&L" && (
                <div className="bg-gray-100 px-6 py-3 flex justify-between items-center text-sm font-semibold">
                    <div className="text-gray-700">Total unrealized P&L</div>
                    <div className="text-emerald-500">+0.719% (+3.014)</div>
                </div>
            )}

            {/* Bottom Scroll Arrow */}
            <div className="bg-stone-200/50 h-8 flex justify-center items-center rounded-b-xl">
                <div className="w-6 h-6 flex items-center justify-center text-blue-900 text-xl">▼</div>
            </div>
        </div>
    );
};

export default TradeHistoryTable;

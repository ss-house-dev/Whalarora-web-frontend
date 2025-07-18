'use client'

import { useEffect, useState } from 'react'
import TradingViewChart from './TradingViewChart'

const InteractiveChart = () => {
    const [symbolList, setSymbolList] = useState<string[]>([])
    const [search, setSearch] = useState('')
    const [symbol, setSymbol] = useState('BINANCE:BTCUSDT')

    // symbol list จาก Binance API
    useEffect(() => {
        fetch('https://api.binance.com/api/v3/exchangeInfo')
            .then(res => res.json())
            .then(data => {
                const symbols = data.symbols
                    .filter((s: any) => s.quoteAsset === 'USDT')
                    .map((s: any) => `BINANCE:${s.baseAsset}USDT`)
                setSymbolList(symbols)
            })
    }, [])

    const filtered = symbolList.filter(s =>
        s.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="w-full max-w-2xl mx-auto">
            <input
                type="text"
                className="w-full px-4 py-2 rounded bg-white/5 text-white placeholder:text-white/50 border border-white/10 focus:ring-2 focus:ring-cyan-400"
                placeholder="ค้นหาเหรียญ เช่น BTC, ETH..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
                <ul className="border rounded mt-1 text-black bg-white shadow max-h-60 overflow-y-auto">
                    {filtered.length > 0 ? (
                        filtered.slice(0, 20).map(s => (
                            <li
                                key={s}
                                className="px-4 py-2 hover:bg-gray-500 cursor-pointer"
                                onClick={() => {
                                    setSymbol(s)
                                    setSearch('')
                                }}
                            >
                                {s}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-gray-500">ไม่พบเหรียญ</li>
                    )}
                </ul>
            )}

            {/* ✅ Chart หลักแค่ตัวเดียว */}
            <div className="mt-6 bg-white/5 backdrop-blur-md p-4 rounded-xl shadow-lg">
                <TradingViewChart symbol={symbol} />
            </div>
        </div>
    )
}

export default InteractiveChart

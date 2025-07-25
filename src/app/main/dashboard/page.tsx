// ตัวอย่าง: dashboard page
import TradingViewChart from '@/components/ui/TradingViewChart'
import InteractiveChart from '@/components/ui/Interactivechart'
import OrderBox from '@/components/ui/OrderBox';
import React from 'react';


export default function DashboardPage() {
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <TradingViewChart
                symbol="BINANCE:BTCUSDT"
                interval="15"
                theme="dark"
                height={500}
            />



            <h1 className="text-2xl font-bold text-center mb-4">เลือกเหรียญเพื่อดูกราฟ</h1>
            <InteractiveChart />

            {/* ✅ Order Box Component */}
            <OrderBox />
        </main>
    )
}

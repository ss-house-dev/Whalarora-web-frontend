import React from 'react';
import { useCryptoPrice } from '@/app/main/trading/hooks/useCryptoPrice'

interface PriceWidgetProps {
  symbol: string
}

export const PriceWidget = ({ symbol }: PriceWidgetProps) => {
  const { data, loading, error } = useCryptoPrice(symbol)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!data) return null

  // เพิ่ม debug logs
  console.log('Raw data from API:', data)
  console.log('Price field:', data.price, 'Type:', typeof data.price)

  // ลองใช้ lastPrice แทน price ถ้า price ไม่มีค่า
  const rawPrice = data.price || data.lastPrice
  console.log('Using price value:', rawPrice)

  // ตรวจสอบและแปลงค่าให้ปลอดภัย
  const price = rawPrice ? parseFloat(rawPrice) : 0
  const change = data.priceChange ? parseFloat(data.priceChange) : 0
  const changePercent = data.priceChangePercent ? parseFloat(data.priceChangePercent) : 0
  const highPrice = data.highPrice ? parseFloat(data.highPrice) : 0
  const lowPrice = data.lowPrice ? parseFloat(data.lowPrice) : 0
  const volume = data.volume ? parseFloat(data.volume) : 0
  const quoteVolume = data.quoteVolume ? parseFloat(data.quoteVolume) : 0
  const isPositive = change >= 0

  // แสดง debug info ถ้าราคาเป็น 0
  if (price === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-600 mb-2">Debug: Price showing as $0.00</p>
        <div className="text-xs space-y-1">
          <p><strong>Symbol:</strong> {symbol}</p>
          <p><strong>Raw price:</strong> {data.price} (type: {typeof data.price})</p>
          <p><strong>Raw lastPrice:</strong> {data.lastPrice} (type: {typeof data.lastPrice})</p>
          <p><strong>Parsed price:</strong> {price}</p>
        </div>
        <details className="mt-4">
          <summary className="cursor-pointer text-yellow-700">Show full API response</summary>
          <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  // ตรวจสอบว่าข้อมูลถูกต้อง
  if (isNaN(price)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-600">Invalid price data for {symbol}</p>
        <pre className="text-xs mt-2">{JSON.stringify(data, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="flex h-15 gap-1">
      {/* Blue section */}
      <div className="p-4 border bg-[#1F4293] shadow-inner rounded-l-full flex items-center">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-white">
            {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
          </h2>
          <p className="font-bold text-white">
            {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </p>
        </div>
      </div>

      {/* White section */}
      <div
        className="p-6 bg-white border rounded-r-full flex items-center"
        style={{
          boxShadow: 'inset 0px 4px 4px 0px #B3D3FF, inset 0px 0px 8px 0px #26F6BA'
        }}
      >
        <div className="flex flex-row gap-10 text-sm">
          <div>
            <span className="text-gray-500">1 Day Change</span>
            <p className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
            </p>
          </div>
          <div>
            <span className="text-gray-500">24h High</span>
            <p className="font-medium">{highPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</p>
          </div>
          <div>
            <span className="text-gray-500">24h Low</span>
            <p className="font-medium">{lowPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</p>
          </div>
          <div>
            <span className="text-gray-500">24h Volume</span>
            <p className="font-medium">{volume.toLocaleString('en-US', { maximumFractionDigits: 3 })}</p>
          </div>
          <div>
            <span className="text-gray-500">24h Volume (USDT)</span>
            <p className="font-medium">${quoteVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>
    </div>
  )

}

export default PriceWidget;
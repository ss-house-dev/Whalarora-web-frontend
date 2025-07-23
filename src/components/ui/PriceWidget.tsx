'use client'

import { useCryptoPrice } from '@/hooks/useCryptoPrice'

interface PriceWidgetProps {
  symbol: string
}

export const PriceWidget = ({ symbol }: PriceWidgetProps) => {
  const { data, loading, error } = useCryptoPrice(symbol)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!data) return null

  // ตรวจสอบและแปลงค่าให้ปลอดภัย
  const price = data.price ? parseFloat(data.price) : 0
  const change = data.priceChange ? parseFloat(data.priceChange) : 0
  const changePercent = data.priceChangePercent ? parseFloat(data.priceChangePercent) : 0
  const highPrice = data.highPrice ? parseFloat(data.highPrice) : 0
  const lowPrice = data.lowPrice ? parseFloat(data.lowPrice) : 0
  const volume = data.volume ? parseFloat(data.volume) : 0
  const quoteVolume = data.quoteVolume ? parseFloat(data.quoteVolume) : 0
  const isPositive = change >= 0

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
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
        </h2>
        <div className={`flex items-center gap-2 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span className="font-medium">
            {isPositive ? '+' : ''}${change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
          </span>
          <span className="font-medium">
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">24h High</span>
          <p className="font-medium">${highPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
        </div>
        <div>
          <span className="text-gray-500">24h Low</span>
          <p className="font-medium">${lowPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
        </div>
        <div>
          <span className="text-gray-500">24h Volume</span>
          <p className="font-medium">{volume.toLocaleString('en-US', { maximumFractionDigits: 3 })}</p>
        </div>
        <div>
          <span className="text-gray-500">24h Volume (USDT)</span>
          <p className="font-medium">${quoteVolume.toLocaleString('en-US', { maximumFractionDigits: 3 })}</p>
        </div>
      </div>
    </div>
  )
}
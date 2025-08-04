import { useState, useEffect } from 'react'

interface PriceData {
  symbol: string
  price?: string
  lastPrice?: string  
  priceChangePercent: string
  priceChange: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
}

export const useCryptoPrice = (symbol: string) => {
  const [data, setData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setLoading(true)
        
        const cleanSymbol = symbol.replace('BINANCE:', '')
        
        console.log('Fetching data for:', cleanSymbol) // Debug log
        
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbol=${cleanSymbol}`
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('API Response:', result) // Debug log
        console.log('Price fields - price:', result.price, 'lastPrice:', result.lastPrice)
        
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Fetch error:', err) // Debug log
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchPrice()
      // อัพเดททุก 3 วินาที
      const interval = setInterval(fetchPrice, 3000)
      return () => clearInterval(interval)
    }
  }, [symbol])

  return { data, loading, error }
}
import { useState, useEffect } from "react";

export function useMarketPrice() {
  const [marketPrice, setMarketPrice] = useState<string>("");

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p).toFixed(2);
      setMarketPrice(price);
    };
  }, []);

  return marketPrice;
}

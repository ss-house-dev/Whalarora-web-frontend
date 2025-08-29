import { useState, useEffect, useRef } from "react";

export function useMarketPrice() {
  const [marketPrice, setMarketPrice] = useState<string>("");
  const lastUpdateTime = useRef<number>(0);

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

    ws.onmessage = (event) => {
      const currentTime = Date.now();

      // ตรวจสอบว่าผ่านไป 1 วินาทีแล้วหรือยัง
      if (currentTime - lastUpdateTime.current >= 1000) {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p).toFixed(2);
        setMarketPrice(price);
        lastUpdateTime.current = currentTime;
      }
    };
  }, []);

  return marketPrice;
}

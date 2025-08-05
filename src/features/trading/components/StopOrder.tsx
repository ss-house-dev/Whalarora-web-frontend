import { Dispatch, SetStateAction } from "react";

interface StopOrderProps {
  stopPrice: number;
  setStopPrice: Dispatch<SetStateAction<number>>;
  limitPrice: number;
  setLimitPrice: Dispatch<SetStateAction<number>>;
}

export default function StopOrder({
  stopPrice,
  setStopPrice,
  limitPrice,
  setLimitPrice,
}: StopOrderProps) {
  return (
    <>
      <div className="flex items-center border px-4 py-2 rounded-md bg-white">
        <span className="text-sm text-gray-400 flex-1">Stop price</span>
        <div className="flex items-center">
          <input
            type="number"
            step="0.01"
            min="0"
            value={stopPrice}
            onChange={(e) => setStopPrice(Number(e.target.value))}
            className="bg-transparent border-none outline-none text-gray-800 font-semibold text-lg focus:ring-0 text-right w-32"
            placeholder="0.00"
          />
          <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
        </div>
      </div>
      <div className="flex items-center border px-4 py-2 rounded-md bg-white">
        <span className="text-sm text-gray-400 flex-1">Limit price</span>
        <div className="flex items-center">
          <input
            type="number"
            step="0.01"
            min="0"
            value={limitPrice}
            onChange={(e) => setLimitPrice(Number(e.target.value))}
            className="bg-transparent border-none outline-none text-gray-800 font-semibold text-lg focus:ring-0 text-right w-32"
            placeholder="0.00"
          />
          <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
        </div>
      </div>
    </>
  );
}
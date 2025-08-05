import { Dispatch, SetStateAction } from "react";

interface LimitOrderProps {
  price: number;
  setPrice: Dispatch<SetStateAction<number>>;
  priceLabel: string;
}

export default function LimitOrder({ price, setPrice, priceLabel }: LimitOrderProps) {
  return (
    <div className="flex items-center border px-4 py-2 rounded-md bg-white">
      <span className="text-sm text-gray-400 flex-1">{priceLabel}</span>
      <div className="flex items-center">
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="bg-transparent border-none outline-none text-gray-800 font-semibold text-lg focus:ring-0 text-right w-32"
          placeholder="0.00"
        />
        <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
      </div>
    </div>
  );
}
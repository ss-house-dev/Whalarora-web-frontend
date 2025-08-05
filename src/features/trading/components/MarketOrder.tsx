interface MarketOrderProps {
  price: number;
  priceLabel: string;
  error: boolean;
}

export default function MarketOrder({ price, priceLabel, error }: MarketOrderProps) {
  return (
    <div className="flex items-center border px-4 py-2 rounded-md bg-gray-100">
      <span className="text-sm text-gray-400 flex-1">{priceLabel}</span>
      <span className="font-semibold text-lg text-gray-800">
        {error
          ? "Error"
          : price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
        <span className="ml-1 text-gray-400 text-sm font-normal">USDT</span>
      </span>
    </div>
  );
}
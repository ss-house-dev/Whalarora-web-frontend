'use client';

import { useEffect, useState } from 'react';

type Pair = {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
};

export default function Page() {
  const [pairs, setPairs] = useState<Pair[]>([]);

  useEffect(() => {
    fetch('/api/pairs')
      .then(async (res) => {
        console.log('res.status:', res.status); //  Debug
        const json = await res.json();          
        setPairs(json);
      })
      .catch((err) => console.error('Fetch error:', err));
  }, []);

  return (
    <div>
      <h1>USDT Pairs</h1>
      <ul>
        {pairs.map((pair) => (
          <li key={pair.symbol}>
            {pair.baseAsset} / {pair.quoteAsset}
          </li>
        ))}
      </ul>
    </div>
  );
}

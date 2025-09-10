export const SYMBOL_NAME: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ADA: 'Cardano',
  BNB: 'Binance Coin',
  DOGE: 'Dogecoin',
  CASH: 'Cash',
};

// TEMP ไว้เทสก่อน มี price feed จริงค่อยเปลี่ยน
export const PRICE_MAP: Partial<Record<string, number>> = {
  BTC: 115200,
  ETH: 4000,
  ADA: 0.5,
  BNB: 600,
  DOGE: 0.1,
  CASH: 1,
};

// src/types/symbol-types.ts
// This file defines the types related to trading symbols in a financial application.
export interface SymbolInfo {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
}

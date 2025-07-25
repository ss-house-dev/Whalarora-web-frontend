"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// สร้าง context สำหรับ balance
interface BalanceContextType {
    balance: number;
    setBalance: (value: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

// สร้าง Provider
export const BalanceProvider = ({ children }: { children: ReactNode }) => {
    const [balance, setBalance] = useState(10000);
    return (
        <BalanceContext.Provider value={{ balance, setBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

// Hook สำหรับใช้งาน context นี้
export const useBalance = (): BalanceContextType => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error("useBalance must be used within a BalanceProvider");
    }
    return context;
};

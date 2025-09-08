"use client";
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useGetOpenOrders } from '../hooks/useGetOpenOrders';
import { OpenOrder, OpenOrdersState } from '../types';
import { DEFAULT_PAGINATION } from '../constants';

interface OpenOrdersContextValue {
  // State
  orders: OpenOrder[];
  pagination: OpenOrdersState['pagination'];
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshOrders: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  toggleAutoRefresh: () => void;
  
  // Settings
  autoRefresh: boolean;
}

const OpenOrdersContext = createContext<OpenOrdersContextValue | undefined>(undefined);

interface OpenOrdersProviderProps {
  children: React.ReactNode;
  initialPage?: number;
  initialLimit?: number;
  initialAutoRefresh?: boolean;
}

export const OpenOrdersProvider: React.FC<OpenOrdersProviderProps> = ({
  children,
  initialPage = DEFAULT_PAGINATION.page,
  initialLimit = DEFAULT_PAGINATION.limit,
  initialAutoRefresh = true,
}) => {
  const [page, setCurrentPage] = useState(initialPage);
  const [limit, setCurrentLimit] = useState(initialLimit);
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetOpenOrders({
    page,
    limit,
    autoRefresh,
  });

  const setPage = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setCurrentLimit(newLimit);
    setCurrentPage(1); // Reset to first page when limit changes
  }, []);

  const refreshOrders = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  const value: OpenOrdersContextValue = {
    // State
    orders: data?.formattedOrders || [],
    pagination: {
      page: data?.page || page,
      limit: data?.limit || limit,
      total: data?.total || 0,
      totalPages: data?.totalPages || 0,
    },
    loading: isLoading,
    error: error?.message || null,
    
    // Actions
    refreshOrders,
    setPage,
    setLimit,
    toggleAutoRefresh,
    
    // Settings
    autoRefresh,
  };

  return (
    <OpenOrdersContext.Provider value={value}>
      {children}
    </OpenOrdersContext.Provider>
  );
};

export const useOpenOrders = (): OpenOrdersContextValue => {
  const context = useContext(OpenOrdersContext);
  if (context === undefined) {
    throw new Error('useOpenOrders must be used within an OpenOrdersProvider');
  }
  return context;
};
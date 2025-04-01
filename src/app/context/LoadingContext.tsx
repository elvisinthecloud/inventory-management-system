'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => {
    console.log('>>> LoadingContext: startLoading called');
    setIsLoading(true);
  };

  const stopLoading = () => {
    console.log('<<< LoadingContext: stopLoading called');
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}; 
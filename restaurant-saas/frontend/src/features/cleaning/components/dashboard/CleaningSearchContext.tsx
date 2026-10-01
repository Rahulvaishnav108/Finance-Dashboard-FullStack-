import React, { createContext, useContext, useState } from 'react';

interface CleaningSearchContextProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CleaningSearchContext = createContext<CleaningSearchContextProps | undefined>(undefined);

export function CleaningSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <CleaningSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </CleaningSearchContext.Provider>
  );
}

export function useCleaningSearch() {
  const context = useContext(CleaningSearchContext);
  if (!context) {
    throw new Error('useCleaningSearch must be used within a CleaningSearchProvider');
  }
  return context;
}

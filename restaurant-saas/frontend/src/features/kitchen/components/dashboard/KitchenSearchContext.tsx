import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface KitchenSearchContextType {
  query: string;
  setQuery: (q: string) => void;
}

const KitchenSearchContext = createContext<KitchenSearchContextType>({
  query: '',
  setQuery: () => {},
});

export function KitchenSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return (
    <KitchenSearchContext.Provider value={value}>
      {children}
    </KitchenSearchContext.Provider>
  );
}

export function useKitchenSearch() {
  return useContext(KitchenSearchContext);
}

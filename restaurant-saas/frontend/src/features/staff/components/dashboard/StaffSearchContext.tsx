import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';

interface StaffSearchContextType {
  query: string;
  setQuery: (q: string) => void;
}

const StaffSearchContext = createContext<StaffSearchContextType>({
  query: '',
  setQuery: () => {},
});

export function StaffSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);
  return (
    <StaffSearchContext.Provider value={value}>
      {children}
    </StaffSearchContext.Provider>
  );
}

export function useStaffSearch() {
  return useContext(StaffSearchContext);
}

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectionContextType {
  selectedMemberId: string | null; // null represents "Family"
  setSelectedMemberId: (id: string | null) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  return (
    <SelectionContext.Provider value={{ selectedMemberId, setSelectedMemberId }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

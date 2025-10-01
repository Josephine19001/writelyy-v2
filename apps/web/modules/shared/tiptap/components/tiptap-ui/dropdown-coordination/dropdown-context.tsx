"use client";

import * as React from "react";

interface DropdownContextType {
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
}

const DropdownContext = React.createContext<DropdownContextType | null>(null);

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ openDropdown, setOpenDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdownCoordination(id: string) {
  const context = React.useContext(DropdownContext);
  
  if (!context) {
    // Fallback if no provider - just manage local state
    const [isOpen, setIsOpen] = React.useState(false);
    return {
      isOpen,
      setIsOpen,
    };
  }

  const { openDropdown, setOpenDropdown } = context;
  const isOpen = openDropdown === id;

  const setIsOpen = React.useCallback((open: boolean) => {
    if (open) {
      setOpenDropdown(id);
    } else {
      setOpenDropdown(null);
    }
  }, [id, setOpenDropdown]);

  return {
    isOpen,
    setIsOpen,
  };
}
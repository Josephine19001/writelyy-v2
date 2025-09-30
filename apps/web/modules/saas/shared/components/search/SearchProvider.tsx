"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface SearchContextType {
	isSearchOpen: boolean;
	openSearch: () => void;
	closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within SearchProvider");
	}
	return context;
};

interface SearchProviderProps {
	children: React.ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const openSearch = useCallback(() => {
		setIsSearchOpen(true);
	}, []);

	const closeSearch = useCallback(() => {
		setIsSearchOpen(false);
	}, []);

	const contextValue: SearchContextType = {
		isSearchOpen,
		openSearch,
		closeSearch,
	};

	return (
		<SearchContext.Provider value={contextValue}>
			{children}
		</SearchContext.Provider>
	);
}
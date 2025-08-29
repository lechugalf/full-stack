import React, { createContext, useCallback, useContext, useState } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async (query, page, limit, signal) => {
    const res = await fetch(
      `http://localhost:3001/api/items?limit=${limit}&page=${page}&q=${query}`,
      {
        signal,
      }
    );

    const json = await res.json();
    setItems(json);
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

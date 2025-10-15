// components/providers/StoreProvider.tsx
"use client"; // VERY IMPORTANT!

import React, { createContext, useState, useContext, ReactNode } from "react";

export interface Store {
  name: string;
  image: string;
  section: string;
  description: string;
  address: string;
  id: string;
}

interface StoreContextProps {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
  storeName: string;
  setStoreName: React.Dispatch<React.SetStateAction<string>>;
}

const StoreContext = createContext<StoreContextProps>({
  stores: [],
  setStores: () => {},
  storeName: "",
  setStoreName: () => {},
});

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeName, setStoreName] = useState("");

  return (
    <StoreContext.Provider
      value={{ stores, setStores, storeName, setStoreName }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

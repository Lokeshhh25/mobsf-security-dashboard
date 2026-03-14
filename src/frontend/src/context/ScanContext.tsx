import { type ReactNode, createContext, useContext, useState } from "react";

interface ScanContextValue {
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
}

const ScanContext = createContext<ScanContextValue>({
  selectedJobId: null,
  setSelectedJobId: () => {},
});

export function ScanProvider({ children }: { children: ReactNode }) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  return (
    <ScanContext.Provider value={{ selectedJobId, setSelectedJobId }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  return useContext(ScanContext);
}

import React, { createContext, useContext, useState } from 'react';
import { BigFiveProfile } from '@/lib/bigfive';

interface BigFiveContextType {
  profiles: BigFiveProfile[];
  addProfiles: (newProfiles: BigFiveProfile[]) => void;
  selectedProfile: BigFiveProfile | null;
  setSelectedProfile: (profile: BigFiveProfile | null) => void;
  clearData: () => void;
}

const BigFiveContext = createContext<BigFiveContextType | undefined>(undefined);

export function BigFiveProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<BigFiveProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BigFiveProfile | null>(null);

  const addProfiles = (newProfiles: BigFiveProfile[]) => {
    setProfiles((prev) => [...prev, ...newProfiles]);
  };

  const clearData = () => {
    setProfiles([]);
    setSelectedProfile(null);
  };

  return (
    <BigFiveContext.Provider
      value={{
        profiles,
        addProfiles,
        selectedProfile,
        setSelectedProfile,
        clearData,
      }}
    >
      {children}
    </BigFiveContext.Provider>
  );
}

export function useBigFive() {
  const context = useContext(BigFiveContext);
  if (!context) {
    throw new Error('useBigFive must be used within BigFiveProvider');
  }
  return context;
}

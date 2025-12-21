import { useEffect } from 'react';
import { combine } from 'zustand/middleware';
import { createWithEqualityFn as create } from 'zustand/traditional';

const storageKey = 'pow-protection';

export interface StorageData {}

interface StorageStore extends StorageData {
  reset: () => void;
}

const defaults: StorageData = {};

function loadFromStorage(): StorageData {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : undefined;

  return {
    ...defaults,
    ...(stored ? JSON.parse(stored) : {}),
  };
}

export const useStorageStore = create(
  combine<StorageData, StorageStore>(loadFromStorage(), (set, get) => ({
    ...loadFromStorage(),
    reset: () => set(defaults),
  })),
);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({}));
  }, []);

  return children;
}

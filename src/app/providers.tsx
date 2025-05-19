'use client';

import { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const hydrate = useAppStore((state) => state);
  
  // Hydrate the store on client side
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // @ts-ignore - skipHydration is a custom property
      hydrate._persist?.rehydrate();
    }
  }, [hydrate]);
  
  return <>{children}</>;
} 
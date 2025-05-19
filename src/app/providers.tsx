'use client';

import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const hydrate = useAppStore((state) => state);
  
  // Hydrate the store on client side
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      // @ts-ignore - skipHydration is a custom property
      hydrate._persist?.rehydrate();
      setIsHydrated(true);
    }
  }, [hydrate]);
  
  // This prevents hydration errors by only rendering children after hydration is complete
  if (!isHydrated) {
    return null;
  }
  
  return <>{children}</>;
} 
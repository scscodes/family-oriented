"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/appStore';
import { useShallow } from 'zustand/react/shallow';

// Dynamically import debug components to prevent SSR issues
const UnifiedDebugBanner = dynamic(
  () => import("@/shared/components/debug/UnifiedDebugBanner"),
  { ssr: false }
);

const DemoSuccessNotification = dynamic(
  () => import("@/shared/components/debug/DemoSuccessNotification"),
  { ssr: false }
);

/**
 * A wrapper component that only renders children on the client side
 * Prevents hydration mismatches for components that behave differently on server vs client
 */
export function ClientOnlyWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}

export default function HydrationGatedUI() {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Get hydration state from Zustand
  const { isHydrated, isFullyLoaded } = useAppStore(
    useShallow((state) => ({
      isHydrated: state.isHydrated,
      isFullyLoaded: state.isFullyLoaded,
    }))
  );

  // Check if everything is loaded
  const isReady = isHydrated && isFullyLoaded();

  // Don't render anything until hydrated to prevent mismatches
  if (!isReady) {
    return null;
  }

  return (
    <>
      {isProd && (
        <div style={{
          width: '100%',
          background: '#fffbe6',
          color: '#ad6800',
          textAlign: 'center',
          padding: '8px 0',
          fontWeight: 600,
          fontSize: '1rem',
          borderBottom: '1px solid #ffe58f',
          zIndex: 2000,
          position: 'relative',
        }}>
          🚧 This product is under active development and updated frequently. Features and appearance may change at any time.
        </div>
      )}
      <UnifiedDebugBanner />
      <DemoSuccessNotification />
    </>
  );
} 
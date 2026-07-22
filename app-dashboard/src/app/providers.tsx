"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUIStore } from "@/store/ui-store";

function ThemeSync() {
  const theme = useUIStore((s) => s.theme);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const highContrast = useUIStore((s) => s.highContrast);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
  }));

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delay={150}>
        <ThemeSync />
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

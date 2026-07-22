import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 30_000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Date.now();
}

function getServerSnapshot() {
  return 0;
}

/** Ticking clock via useSyncExternalStore -- avoids setState-in-effect and SSR/client mismatch. */
export function useClock(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ms === 0 ? null : new Date(ms);
}

import { useSyncExternalStore } from "react";

/** Cached outside the hook: getSnapshot must return a stable value between
 * ticks, or useSyncExternalStore sees a "change" on every render and loops. */
let cached = Date.now();

function subscribe(callback: () => void) {
  const id = setInterval(() => {
    cached = Date.now();
    callback();
  }, 30_000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return cached;
}

function getServerSnapshot() {
  return 0;
}

/** Ticking clock via useSyncExternalStore -- avoids setState-in-effect and SSR/client mismatch. */
export function useClock(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ms === 0 ? null : new Date(ms);
}

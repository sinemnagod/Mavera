import { useEffect } from "react";
import { useRevalidator } from "react-router";

// Re-runs the page's loader every few seconds, so one person's action shows up on another's screen.
export function usePolling(intervalMs: number) {
  const { revalidate, state } = useRevalidator();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && state === "idle") void revalidate();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, revalidate, state]);
}

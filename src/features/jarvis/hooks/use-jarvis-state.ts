"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JarvisState } from "../types/jarvis";

export function useJarvisState() {
  const [state, setState] = useState<JarvisState>("awakening");
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transitionTo = useCallback((next: JarvisState, fallback?: JarvisState, delay = 1400) => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    setState(next);
    if (fallback) transitionTimer.current = setTimeout(() => setState(fallback), delay);
  }, []);

  useEffect(() => {
    transitionTimer.current = setTimeout(() => setState("idle"), 1100);
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  return { state, transitionTo };
}

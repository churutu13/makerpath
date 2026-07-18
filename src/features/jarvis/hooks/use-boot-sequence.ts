"use client";

import { useEffect, useState } from "react";

const bootSteps = [
  "Loading User...",
  "Loading Progress...",
  "Loading Roadmap...",
  "Loading Jarvis...",
  "Ready",
];

export function useBootSequence(reducedMotion: boolean) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [complete, setComplete] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const timers = bootSteps.map((_, index) =>
      setTimeout(() => setVisibleSteps(index + 1), 280 + index * 300)
    );
    timers.push(setTimeout(() => setComplete(true), 1950));
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return { steps: bootSteps, visibleSteps, complete };
}

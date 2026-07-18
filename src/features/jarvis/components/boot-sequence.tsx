"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { useBootSequence } from "../hooks/use-boot-sequence";

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const reduced = Boolean(useReducedMotion());
  const { steps, visibleSteps, complete } = useBootSequence(reduced);

  useEffect(() => {
    if (complete) onComplete();
  }, [complete, onComplete]);

  return (
    <AnimatePresence>
      {!complete && (
        <motion.div className="jarvis-boot" exit={{ opacity: 0 }} transition={{ duration: .35 }}>
          <span className="jarvis-boot-dot"/>
          <h1>MakerPath OS</h1>
          <div className="jarvis-boot-log" aria-live="polite">
            {steps.slice(0, visibleSteps).map((step, index) => (
              <motion.span key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: index === visibleSteps - 1 ? 1 : .38, y: 0 }}>{step}</motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

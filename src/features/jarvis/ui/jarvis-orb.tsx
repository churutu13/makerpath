"use client";

import { memo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { stateDefinitions } from "../animations/motion";
import type { JarvisState } from "../types/jarvis";

const particles = [
  { x: 18, y: 24, size: 2, delay: 0 }, { x: 81, y: 31, size: 3, delay: 1.1 },
  { x: 28, y: 78, size: 2, delay: 2.2 }, { x: 73, y: 73, size: 2, delay: .5 },
  { x: 48, y: 11, size: 2, delay: 1.7 }, { x: 91, y: 56, size: 2, delay: 2.8 },
  { x: 9, y: 55, size: 3, delay: 1.3 }, { x: 54, y: 91, size: 2, delay: .8 },
];

export const JarvisOrb = memo(function JarvisOrb({ state, animationsEnabled = true }: { state: JarvisState; animationsEnabled?: boolean }) {
  const reduced = useReducedMotion();
  const motionOff = Boolean(reduced) || !animationsEnabled;
  const definition = stateDefinitions[state];
  return (
    <div className="jarvis-orb-stage" data-state={state} aria-label={`Jarvis: ${definition.label}`} role="img" style={{ "--orb-color": definition.color, "--orb-glow": definition.glow } as React.CSSProperties}>
      {!motionOff && particles.map((particle, index) => (
        <motion.span
          className="jarvis-particle"
          key={index}
          style={{ left: `${particle.x}%`, top: `${particle.y}%`, width: particle.size, height: particle.size }}
          animate={{ opacity: [.12, .75, .12], y: [0, -7, 0] }}
          transition={{ duration: 4.5, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <AnimatePresence>
        {state === "speaking" && !motionOff && [0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="jarvis-speaking-pulse"
            initial={{ opacity: 0, scale: .62 }}
            animate={{ opacity: [0, .2, 0], scale: [.62, 1.03 + index * .09] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, delay: index * .48, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
      <motion.div className="jarvis-ring ring-outer" animate={motionOff ? undefined : { rotate: 360 }} transition={{ duration: definition.rotationDuration, repeat: Infinity, ease: "linear" }}/>
      <motion.div className="jarvis-ring ring-mid" animate={motionOff ? undefined : { rotate: -360 }} transition={{ duration: definition.rotationDuration * .72, repeat: Infinity, ease: "linear" }}/>
      <motion.div
        className="jarvis-orb"
        animate={motionOff ? undefined : { scale: [1, definition.pulseScale, 1] }}
        transition={{ duration: Math.max(2.8, definition.duration * 5), repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="jarvis-orb-core"/>
        <div className="jarvis-orb-sheen"/>
      </motion.div>
      <span className="jarvis-orb-status">{definition.label}</span>
    </div>
  );
});

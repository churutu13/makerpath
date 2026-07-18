import type { Transition, Variants } from "framer-motion";
import type { JarvisState, JarvisStateDefinition } from "../types/jarvis";

export const naturalEase = [0.22, 0.8, 0.3, 1] as const;

export const surfaceTransition: Transition = {
  duration: 0.48,
  ease: naturalEase,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: surfaceTransition },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

export const stateDefinitions: Record<JarvisState, JarvisStateDefinition> = {
  idle: { label: "Standby", color: "#8af5b1", glow: "rgba(138,245,177,.22)", duration: 0.7, pulseScale: 1.025, rotationDuration: 28 },
  awakening: { label: "Awakening", color: "#b7ffe0", glow: "rgba(183,255,224,.32)", duration: 0.9, pulseScale: 1.08, rotationDuration: 12 },
  listening: { label: "Listening", color: "#65d9ff", glow: "rgba(101,217,255,.3)", duration: 0.55, pulseScale: 1.065, rotationDuration: 17 },
  processing: { label: "Processing", color: "#b49cff", glow: "rgba(180,156,255,.28)", duration: 0.45, pulseScale: 1.04, rotationDuration: 6 },
  speaking: { label: "Speaking", color: "#7becc8", glow: "rgba(123,236,200,.3)", duration: 0.38, pulseScale: 1.075, rotationDuration: 14 },
  success: { label: "Complete", color: "#a4f59a", glow: "rgba(164,245,154,.34)", duration: 0.6, pulseScale: 1.1, rotationDuration: 20 },
  error: { label: "Attention", color: "#ff8e8e", glow: "rgba(255,142,142,.3)", duration: 0.5, pulseScale: 1.045, rotationDuration: 9 },
};

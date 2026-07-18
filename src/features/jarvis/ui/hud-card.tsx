"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeUp } from "../animations/motion";

export function HudCard({ label, value, icon: Icon, accent = false }: { label: string; value: string | number; icon: LucideIcon; accent?: boolean }) {
  return (
    <motion.article variants={fadeUp} className={`jarvis-hud-card ${accent ? "accent" : ""}`}>
      <div className="jarvis-hud-label"><Icon size={14}/>{label}</div>
      <div className="jarvis-hud-value">{value}</div>
    </motion.article>
  );
}

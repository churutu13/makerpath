export const JARVIS_STATES = [
  "idle",
  "awakening",
  "listening",
  "processing",
  "speaking",
  "success",
  "error",
] as const;

export type JarvisState = (typeof JARVIS_STATES)[number];

export interface JarvisStateDefinition {
  label: string;
  color: string;
  glow: string;
  duration: number;
  pulseScale: number;
  rotationDuration: number;
}

export interface JarvisTelemetry {
  xp: number;
  levelNumber: number;
  levelName: string;
  roadmapProgress: number;
  streak: number;
  weekHours: number;
  activeProject: string;
  currentMission: string;
  completedTasks: number;
}

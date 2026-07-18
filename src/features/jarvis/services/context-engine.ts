import type { JarvisTelemetry } from "../types/jarvis";

export function buildWelcomeContext(telemetry: JarvisTelemetry) {
  if (telemetry.streak > 1) return `You have maintained a ${telemetry.streak} day streak.`;
  if (telemetry.weekHours === 0) return "You have not logged a study session today.";
  if (telemetry.roadmapProgress === 100) return "Your roadmap is complete.";
  return `Your current mission is ${telemetry.currentMission}.`;
}

export const unknownCommandResponse =
  "Command not recognized. I can help with your roadmap, study sessions, projects, or progress.";

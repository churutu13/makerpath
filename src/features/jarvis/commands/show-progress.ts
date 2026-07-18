import type { VoiceCommand } from "../types/voice";
import { deterministicVariant, formatEnglishDuration } from "../utils/text";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["come sto andando", "mostrami i progressi", "fammi vedere i risultati", "qual è il mio progresso", "a che punto sono"];

export const showProgressCommand: VoiceCommand = {
  id: "SHOW_PROGRESS",
  description: "Show and summarize your progress",
  phrases,
  matcher: matcherFor(phrases),
  handler: () => ({ action: { type: "none" } }),
  responseBuilder: ({ telemetry }) => {
    const openings = ["Your status is up to date.", "Here is your current status.", "Progress report ready."];
    return `${deterministicVariant(openings, telemetry.completedTasks)} You have completed ${telemetry.roadmapProgress} percent of the roadmap. You are at level ${telemetry.levelNumber}, with ${telemetry.xp} XP. This week you studied for ${formatEnglishDuration(Math.round(telemetry.weekHours * 60))} and completed ${telemetry.completedTasks} tasks. Your current streak is ${telemetry.streak} days.`;
  },
  availability: alwaysAvailable,
  futureFlags: ["llm-summary"],
};

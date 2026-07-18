import type { VoiceCommand } from "../types/voice";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["qual è la prossima missione", "cosa devo fare", "prossima attività", "qual è il prossimo obiettivo", "cosa faccio adesso"];

export const nextMissionCommand: VoiceCommand = {
  id: "NEXT_MISSION",
  description: "Identify your next mission",
  phrases,
  matcher: matcherFor(phrases),
  handler: () => ({ action: { type: "none" } }),
  responseBuilder: ({ telemetry }) => `Your next mission is ${telemetry.currentMission}.`,
  availability: alwaysAvailable,
  futureFlags: ["adaptive-planning"],
};

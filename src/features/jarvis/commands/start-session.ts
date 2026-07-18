import type { VoiceCommand } from "../types/voice";
import { deterministicVariant } from "../utils/text";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["avvia una sessione", "inizia sessione", "avvia il timer", "cominciamo a studiare", "start sessione"];

export const startSessionCommand: VoiceCommand = {
  id: "START_SESSION",
  description: "Start a study session",
  phrases,
  matcher: matcherFor(phrases),
  handler: ({ timer }) => ({ action: timer.running ? { type: "none" } : { type: "start-session" } }),
  responseBuilder: ({ timer, telemetry }) => timer.running
    ? "A study session is already running."
    : deterministicVariant(["Session started.", "Timer started. Good work.", "Everything is ready. Your session has started."], telemetry.completedTasks),
  availability: alwaysAvailable,
  futureFlags: ["focus-mode"],
};

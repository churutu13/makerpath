import type { VoiceCommand } from "../types/voice";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["termina la sessione", "stop sessione", "ferma il timer", "concludi la sessione", "salva la sessione"];

export const stopSessionCommand: VoiceCommand = {
  id: "STOP_SESSION",
  description: "Stop and save the current session",
  phrases,
  matcher: matcherFor(phrases),
  handler: ({ timer }) => ({ action: timer.running || timer.accumulated > 0 ? { type: "stop-session" } : { type: "none" } }),
  responseBuilder: ({ timer }) => timer.running || timer.accumulated > 0 ? "Session completed and saved." : "There is no session to stop.",
  availability: alwaysAvailable,
  futureFlags: [],
};

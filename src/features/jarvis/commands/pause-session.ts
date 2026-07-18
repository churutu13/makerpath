import type { VoiceCommand } from "../types/voice";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["metti in pausa", "pausa sessione", "ferma un attimo il timer", "sospendi la sessione"];

export const pauseSessionCommand: VoiceCommand = {
  id: "PAUSE_SESSION",
  description: "Pause the current study session",
  phrases,
  matcher: matcherFor(phrases),
  handler: ({ timer }) => ({ action: timer.running ? { type: "pause-session" } : { type: "none" } }),
  responseBuilder: ({ timer }) => timer.running ? "Session paused." : "There is no active session to pause.",
  availability: alwaysAvailable,
  futureFlags: [],
};

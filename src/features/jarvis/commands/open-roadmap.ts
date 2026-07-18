import type { VoiceCommand } from "../types/voice";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["apri la roadmap", "mostra la roadmap", "vai alla roadmap", "fammi vedere il percorso"];

export const openRoadmapCommand: VoiceCommand = {
  id: "OPEN_ROADMAP",
  description: "Open your roadmap",
  phrases,
  matcher: matcherFor(phrases),
  handler: () => ({ action: { type: "navigate", path: "/roadmap" } }),
  responseBuilder: () => "Opening your roadmap.",
  availability: alwaysAvailable,
  futureFlags: [],
};

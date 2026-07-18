import type { VoiceCommand } from "../types/voice";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["apri i progetti", "mostra i progetti", "vai ai progetti", "fammi vedere i progetti"];

export const openProjectsCommand: VoiceCommand = {
  id: "OPEN_PROJECTS",
  description: "Open your projects",
  phrases,
  matcher: matcherFor(phrases),
  handler: () => ({ action: { type: "navigate", path: "/projects" } }),
  responseBuilder: () => "Opening your projects.",
  availability: alwaysAvailable,
  futureFlags: [],
};

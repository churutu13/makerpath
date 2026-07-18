import type { VoiceCommand } from "../types/voice";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["cosa puoi fare", "aiuto", "mostra i comandi", "come puoi aiutarmi", "help"];

export const helpCommand: VoiceCommand = {
  id: "HELP",
  description: "List the available commands",
  phrases,
  matcher: matcherFor(phrases),
  handler: () => ({ action: { type: "none" } }),
  responseBuilder: ({ availableCommands }) => `I can ${availableCommands.map((command) => command.description.toLowerCase()).join(", ")}.`,
  availability: alwaysAvailable,
  futureFlags: [],
};

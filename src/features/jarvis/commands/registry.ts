import type { CommandContext, CommandMatch, VoiceCommand } from "../types/voice";
import { helpCommand } from "./help";
import { logStudyTimeCommand } from "./log-study-time";
import { nextMissionCommand } from "./next-mission";
import { openProjectsCommand } from "./open-projects";
import { openRoadmapCommand } from "./open-roadmap";
import { pauseSessionCommand } from "./pause-session";
import { showProgressCommand } from "./show-progress";
import { startSessionCommand } from "./start-session";
import { stopSessionCommand } from "./stop-session";

export const commandRegistry: VoiceCommand[] = [
  showProgressCommand,
  nextMissionCommand,
  openRoadmapCommand,
  openProjectsCommand,
  startSessionCommand,
  pauseSessionCommand,
  stopSessionCommand,
  logStudyTimeCommand,
  helpCommand,
];

export function matchCommand(input: string, context: CommandContext): CommandMatch | null {
  const matches = commandRegistry
    .filter((command) => command.availability(context))
    .map((command) => ({ command, confidence: command.matcher(input) }))
    .sort((left, right) => right.confidence - left.confidence);
  return matches[0] && matches[0].confidence >= .52 ? matches[0] : null;
}

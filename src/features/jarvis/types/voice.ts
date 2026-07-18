import type { AppData, Area, TimerState } from "@/lib/types";
import type { JarvisTelemetry } from "./jarvis";

export type VoiceCommandId =
  | "SHOW_PROGRESS"
  | "NEXT_MISSION"
  | "OPEN_ROADMAP"
  | "OPEN_PROJECTS"
  | "START_SESSION"
  | "PAUSE_SESSION"
  | "STOP_SESSION"
  | "LOG_STUDY_TIME"
  | "HELP";

export interface ParsedStudyTime {
  duration: number;
  area: Area;
  categoryLabel: string;
}

export type CommandAction =
  | { type: "navigate"; path: "/roadmap" | "/projects" | "/progress" }
  | { type: "start-session" }
  | { type: "pause-session" }
  | { type: "stop-session" }
  | { type: "log-study-time"; payload: ParsedStudyTime }
  | { type: "none" };

export interface CommandExecution {
  action: CommandAction;
  requiresConfirmation?: boolean;
  error?: "missing-duration" | "missing-category";
}

export interface CommandContext {
  data: AppData;
  timer: TimerState;
  telemetry: JarvisTelemetry;
  availableCommands: Array<{ id: VoiceCommandId; description: string }>;
}

export interface VoiceCommand {
  id: VoiceCommandId;
  description: string;
  phrases: string[];
  matcher: (input: string) => number;
  handler: (context: CommandContext, input: string) => CommandExecution;
  responseBuilder: (context: CommandContext, execution: CommandExecution) => string;
  availability: (context: CommandContext) => boolean;
  futureFlags: string[];
}

export interface CommandMatch {
  command: VoiceCommand;
  confidence: number;
}

export type RecognitionMode = "off" | "wake" | "command";

export interface VoiceStatus {
  supported: boolean;
  synthesisSupported: boolean;
  active: boolean;
  mode: RecognitionMode;
  transcript: string;
  response: string;
  error: string | null;
}

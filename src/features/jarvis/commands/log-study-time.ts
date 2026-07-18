import type { ParsedStudyTime, VoiceCommand } from "../types/voice";
import { parseStudyTime } from "../parsers/study-time";
import { formatEnglishDuration } from "../utils/text";
import { alwaysAvailable, matcherFor } from "./shared";

const phrases = ["registra minuti", "registra ore", "aggiungi tempo di studio", "segna minuti", "segna ore", "ho studiato"];

export const logStudyTimeCommand: VoiceCommand = {
  id: "LOG_STUDY_TIME",
  description: "Log study time",
  phrases,
  matcher: (input) => Math.max(matcherFor(phrases)(input), /(registra|aggiungi|segna|studiato).*(minut|or[ae])/.test(input) ? .96 : 0),
  handler: (_context, input) => {
    const parsed = parseStudyTime(input);
    if (!parsed.duration) return { action: { type: "none" }, error: "missing-duration" };
    if (!parsed.area || !parsed.categoryLabel) return { action: { type: "none" }, error: "missing-category" };
    return { action: { type: "log-study-time", payload: parsed as ParsedStudyTime }, requiresConfirmation: true };
  },
  responseBuilder: (_context, execution) => {
    if (execution.error === "missing-duration") return "I could not determine the duration. Please specify minutes or hours.";
    if (execution.error === "missing-category") return "I could not determine the area. You can specify programming, electronics, CAD, design, or AI.";
    if (execution.action.type !== "log-study-time") return "I cannot log this session.";
    return `Please confirm ${formatEnglishDuration(execution.action.payload.duration)} of ${execution.action.payload.categoryLabel}.`;
  },
  availability: alwaysAvailable,
  futureFlags: ["calendar-link"],
};

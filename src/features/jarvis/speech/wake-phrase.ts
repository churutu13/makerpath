import { normalizeText } from "../utils/text";

const wakePhrases = [
  "ciao jarvis",
  "ehi jarvis",
  "hey jarvis",
  "jarvis",
  "jervis",
  "giarvis",
];

export function parseWakePhrase(transcript: string, customPhrase = "Ciao, Jarvis") {
  const normalized = normalizeText(transcript);
  const phrases = [...new Set([normalizeText(customPhrase), ...wakePhrases].filter(Boolean))];
  const wakePhrase = phrases.find((phrase) => normalized.includes(phrase));
  if (!wakePhrase) return { detected: false, command: "" };
  return {
    detected: true,
    command: normalized.replace(wakePhrase, "").trim(),
  };
}

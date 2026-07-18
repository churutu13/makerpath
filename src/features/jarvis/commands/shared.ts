import type { VoiceCommand } from "../types/voice";
import { matchPhrases } from "../utils/fuzzy-match";

export const matcherFor = (phrases: string[]) => (input: string) => matchPhrases(input, phrases);
export const alwaysAvailable: VoiceCommand["availability"] = () => true;

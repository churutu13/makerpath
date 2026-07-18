import { normalizeText } from "./text";

function levenshtein(left: string, right: string) {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (left[i - 1] === right[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[right.length];
}

function phraseScore(input: string, phrase: string) {
  const normalizedInput = normalizeText(input);
  const normalizedPhrase = normalizeText(phrase);
  if (!normalizedInput || !normalizedPhrase) return 0;
  if (normalizedInput === normalizedPhrase) return 1;
  if (normalizedInput.includes(normalizedPhrase) || normalizedPhrase.includes(normalizedInput)) return .92;

  const inputTokens = new Set(normalizedInput.split(" "));
  const phraseTokens = normalizedPhrase.split(" ");
  const overlap = phraseTokens.filter((token) => inputTokens.has(token)).length / phraseTokens.length;
  const distance = levenshtein(normalizedInput, normalizedPhrase);
  const similarity = 1 - distance / Math.max(normalizedInput.length, normalizedPhrase.length);
  return overlap * .62 + Math.max(0, similarity) * .38;
}

export function matchPhrases(input: string, phrases: string[]) {
  return Math.max(0, ...phrases.map((phrase) => phraseScore(input, phrase)));
}

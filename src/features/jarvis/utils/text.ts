const accents: Record<string, string> = {
  à: "a", á: "a", è: "e", é: "e", ì: "i", í: "i", ò: "o", ó: "o", ù: "u", ú: "u",
};

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[àáèéìíòóùú]/g, (letter) => accents[letter] ?? letter)
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function deterministicVariant<T>(items: readonly T[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

export function formatItalianDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} ${remainder === 1 ? "minuto" : "minuti"}`;
  if (!remainder) return `${hours} ${hours === 1 ? "ora" : "ore"}`;
  return `${hours} ${hours === 1 ? "ora" : "ore"} e ${remainder} minuti`;
}

export function formatEnglishDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} ${remainder === 1 ? "minute" : "minutes"}`;
  if (!remainder) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${hours} ${hours === 1 ? "hour" : "hours"} and ${remainder} minutes`;
}

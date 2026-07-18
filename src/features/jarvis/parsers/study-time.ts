import type { Area } from "@/lib/types";
import type { ParsedStudyTime } from "../types/voice";
import { normalizeText } from "../utils/text";

const numbers: Record<string, number> = {
  zero: 0, un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5,
  sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, quindici: 15, venti: 20,
  venticinque: 25, trenta: 30, trentacinque: 35, quaranta: 40,
  quarantacinque: 45, cinquanta: 50, cinquantacinque: 55, sessanta: 60,
  novanta: 90,
};

const categories: Array<{ terms: string[]; area: Area; label: string }> = [
  { terms: ["programmazione", "software", "coding", "codice", "typescript", "python"], area: "Software", label: "programming" },
  { terms: ["elettronica", "hardware", "esp32", "raspberry", "saldatura", "pcb"], area: "Hardware", label: "electronics" },
  { terms: ["cad", "design", "progettazione", "figma", "stampa 3d", "modellazione"], area: "Design", label: "CAD and design" },
  { terms: ["ai", "intelligenza artificiale", "machine learning"], area: "AI", label: "AI" },
];

function numberBefore(text: string, unitPattern: string) {
  const match = text.match(new RegExp(`(\\d+|${Object.keys(numbers).join("|")})\\s+${unitPattern}`));
  if (!match) return null;
  return Number.isNaN(Number(match[1])) ? numbers[match[1]] : Number(match[1]);
}

export function parseStudyTime(input: string): Partial<ParsedStudyTime> {
  const text = normalizeText(input);
  let duration: number | undefined;
  if (text.includes("mezz ora") || text.includes("mezza ora")) duration = 30;

  const hours = numberBefore(text, "or[ae]");
  const minutes = numberBefore(text, "minut[oi]");
  if (hours !== null) duration = hours * 60 + (text.includes("e mezza") ? 30 : minutes ?? 0);
  else if (minutes !== null) duration = minutes;

  const category = categories.find((item) => item.terms.some((term) => text.includes(term)));
  return {
    ...(duration && duration > 0 ? { duration } : {}),
    ...(category ? { area: category.area, categoryLabel: category.label } : {}),
  };
}

function voiceScore(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  const language = voice.lang.toLowerCase();
  let score = language === "en-gb" ? 100 : language === "en-us" ? 90 : language.startsWith("en") ? 70 : 0;
  const maleNames = ["daniel", "aaron", "alex", "arthur", "oliver", "fred", "ralph", "tom", "lee", "gordon"];
  const femaleNames = ["samantha", "victoria", "karen", "moira", "tessa", "serena", "ava", "allison"];
  const maleIndex = maleNames.findIndex((candidate) => name.includes(candidate));
  if (maleIndex >= 0) score += 60 - maleIndex;
  if (femaleNames.some((candidate) => name.includes(candidate))) score -= 35;
  if (voice.localService) score += 20;
  if (["premium", "enhanced", "siri"].some((term) => name.includes(term))) score += 15;
  if (voice.default) score += 5;
  return score;
}

interface SpeechOptions {
  rate: number;
  volume: number;
}

export class BrowserSpeechSynthesis {
  static isSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }

  private bestEnglishMaleVoice() {
    return window.speechSynthesis.getVoices()
      .filter((voice) => voice.lang.toLowerCase().startsWith("en"))
      .sort((left, right) => voiceScore(right) - voiceScore(left))[0] ?? null;
  }

  speak(text: string, options: SpeechOptions) {
    if (!BrowserSpeechSynthesis.isSupported()) return Promise.resolve(false);
    window.speechSynthesis.cancel();
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (result: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(result);
      };
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.bestEnglishMaleVoice();
      utterance.lang = voice?.lang ?? "en-GB";
      utterance.rate = options.rate;
      utterance.pitch = 1;
      utterance.volume = options.volume;
      utterance.voice = voice;
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      const timeout = setTimeout(() => finish(false), Math.max(5000, text.length * 95));
      window.speechSynthesis.speak(utterance);
    });
  }

  cancel() {
    if (BrowserSpeechSynthesis.isSupported()) window.speechSynthesis.cancel();
  }
}

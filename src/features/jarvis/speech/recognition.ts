import type { RecognitionErrorEvent, RecognitionEvent, SpeechRecognitionLike } from "./web-speech-types";

export interface RecognitionCallbacks {
  onInterim: (transcript: string) => void;
  onFinal: (transcript: string) => void;
  onError: (message: string, fatal: boolean) => void;
  onEnd: () => void;
}

const errorMessages: Record<string, string> = {
  "not-allowed": "Permesso microfono non concesso.",
  "service-not-allowed": "Il riconoscimento vocale non è disponibile in questo contesto.",
  "audio-capture": "Microfono non disponibile.",
  network: "Il servizio di riconoscimento del browser non è raggiungibile.",
  "no-speech": "Non ho rilevato alcuna voce.",
};

export class BrowserSpeechRecognition {
  private recognition: SpeechRecognitionLike;
  private started = false;

  static isSupported() {
    return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  constructor(callbacks: RecognitionCallbacks) {
    const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Constructor) throw new Error("Speech recognition unsupported");
    this.recognition = new Constructor();
    this.recognition.lang = "it-IT";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    this.recognition.onresult = (event: RecognitionEvent) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";
        if (result.isFinal) callbacks.onFinal(transcript);
        else interim += transcript;
      }
      if (interim) callbacks.onInterim(interim);
    };
    this.recognition.onerror = (event: RecognitionErrorEvent) => {
      const fatal = ["not-allowed", "service-not-allowed", "audio-capture"].includes(event.error);
      callbacks.onError(errorMessages[event.error] ?? "Riconoscimento vocale temporaneamente non disponibile.", fatal);
    };
    this.recognition.onend = () => {
      this.started = false;
      callbacks.onEnd();
    };
  }

  start() {
    if (this.started) return;
    try {
      this.recognition.start();
      this.started = true;
    } catch {
      this.started = false;
    }
  }

  stop() {
    if (!this.started) return;
    this.recognition.stop();
  }

  abort() {
    this.started = false;
    this.recognition.abort();
  }

  destroy() {
    this.abort();
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;
  }
}

"use client";

import { Check, Mic, MicOff, ShieldAlert, X } from "lucide-react";
import type { ParsedStudyTime, VoiceStatus } from "../types/voice";
import { formatEnglishDuration } from "../utils/text";

interface VoiceConsoleProps {
  status: VoiceStatus;
  pendingLog: ParsedStudyTime | null;
  onActivate: () => void;
  onDeactivate: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  wakePhrase: string;
}

export function VoiceConsole({ status, pendingLog, onActivate, onDeactivate, onConfirm, onCancel, wakePhrase }: VoiceConsoleProps) {
  return (
    <section className={`jarvis-voice-console ${status.active ? "active" : ""}`} aria-live="polite">
      <button
        className="jarvis-mic-button"
        onClick={status.active ? onDeactivate : onActivate}
        disabled={!status.supported}
        aria-label={status.active ? "Disattiva sistema vocale" : "Attiva sistema vocale"}
        aria-pressed={status.active}
      >
        {status.active ? <MicOff size={18}/> : <Mic size={18}/>}
        <span>{!status.supported ? "Voce non disponibile" : status.active ? "Disattiva ascolto" : "Attiva Jarvis"}</span>
      </button>
      {!status.supported ? (
        <p className="jarvis-voice-warning"><ShieldAlert size={13}/>Il browser non supporta il riconoscimento vocale. Il Command Center rimane operativo.</p>
      ) : (
        <p className="jarvis-voice-hint">{status.active ? status.mode === "wake" ? `Pronuncia “${wakePhrase}”` : "Sto ascoltando il comando" : "Il microfono si attiva solo dopo il tuo tocco"}</p>
      )}
      {status.transcript && <div className="jarvis-transcript"><span>Hai detto</span>{status.transcript}</div>}
      {status.response && <div className="jarvis-response"><span>Jarvis</span>{status.response}</div>}
      {status.error && <p className="jarvis-voice-error">{status.error}</p>}
      {pendingLog && (
        <div className="jarvis-confirmation">
          <p><strong>{formatEnglishDuration(pendingLog.duration)}</strong><span>{pendingLog.categoryLabel}</span></p>
          <div>
            <button onClick={onConfirm}><Check size={14}/>Conferma</button>
            <button onClick={onCancel}><X size={14}/>Annulla</button>
          </div>
        </div>
      )}
    </section>
  );
}

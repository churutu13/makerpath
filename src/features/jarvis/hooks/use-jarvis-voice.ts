"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { currentPhase } from "@/lib/stats";
import { createId } from "@/lib/id";
import { commandRegistry, matchCommand } from "../commands/registry";
import { buildWelcomeContext, unknownCommandResponse } from "../services/context-engine";
import { createJarvisTelemetry } from "../services/telemetry";
import { playJarvisSound } from "../speech/activation-sound";
import { BrowserSpeechRecognition } from "../speech/recognition";
import { parseWakePhrase } from "../speech/wake-phrase";
import { BrowserSpeechSynthesis } from "../tts/speech-synthesis";
import type { CommandAction, CommandContext, ParsedStudyTime, RecognitionMode, VoiceStatus } from "../types/voice";
import type { JarvisState } from "../types/jarvis";

interface JarvisVoiceOptions {
  booted: boolean;
  transitionTo: (next: JarvisState, fallback?: JarvisState, delay?: number) => void;
}

const initialStatus: VoiceStatus = {
  supported: false,
  synthesisSupported: false,
  active: false,
  mode: "off",
  transcript: "",
  response: "",
  error: null,
};

const welcomeMessage = "Welcome back. MakerPath is operational. How can I assist you?";

export function useJarvisVoice({ booted, transitionTo }: JarvisVoiceOptions) {
  const router = useRouter();
  const { data, timer, startTimer, pauseTimer, stopTimer, addSession } = useApp();
  const [status, setStatus] = useState<VoiceStatus>(initialStatus);
  const [pendingLog, setPendingLog] = useState<ParsedStudyTime | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const synthesisRef = useRef<BrowserSpeechSynthesis | null>(null);
  const activeRef = useRef(false);
  const modeRef = useRef<RecognitionMode>("off");
  const suppressRestartRef = useRef(false);
  const speakingRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakeFromInterimRef = useRef(false);
  const greetingSentRef = useRef(false);
  const greetingSpokenRef = useRef(false);
  const dataRef = useRef(data);
  const timerRef = useRef(timer);
  const telemetry = useMemo(() => createJarvisTelemetry(data), [data]);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { timerRef.current = timer; }, [timer]);

  const setMode = useCallback((mode: RecognitionMode) => {
    modeRef.current = mode;
    setStatus((current) => ({ ...current, mode }));
  }, []);

  const commandContext = useCallback((): CommandContext => {
    const currentData = dataRef.current;
    const currentTelemetry = createJarvisTelemetry(currentData);
    const base = {
      data: currentData,
      timer: timerRef.current,
      telemetry: currentTelemetry,
      availableCommands: [] as CommandContext["availableCommands"],
    };
    base.availableCommands = commandRegistry.filter((command) => command.availability(base)).map(({ id, description }) => ({ id, description }));
    return base;
  }, []);

  const restartWakeListening = useCallback(() => {
    if (!activeRef.current || speakingRef.current) return;
    if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
    wakeFromInterimRef.current = false;
    suppressRestartRef.current = false;
    setMode("wake");
    transitionTo("idle");
    recognitionRef.current?.start();
  }, [setMode, transitionTo]);

  const speak = useCallback(async (text: string, returnToWake = true) => {
    const settings = dataRef.current.settings.jarvis;
    setStatus((current) => ({ ...current, response: text }));
    if (!settings.voiceResponses) {
      transitionTo("success", "idle", 500);
      playJarvisSound("success", settings.sounds, settings.voiceVolume);
      if (returnToWake && activeRef.current) restartTimerRef.current = setTimeout(restartWakeListening, 550);
      return false;
    }
    suppressRestartRef.current = true;
    speakingRef.current = true;
    recognitionRef.current?.stop();
    transitionTo("speaking");
    const spoken = await synthesisRef.current?.speak(text, {
      rate: settings.voiceRate,
      volume: settings.voiceVolume,
    }) ?? false;
    speakingRef.current = false;
    playJarvisSound("success", settings.sounds, settings.voiceVolume);
    transitionTo("success", "idle", 650);
    if (returnToWake && activeRef.current) {
      restartTimerRef.current = setTimeout(restartWakeListening, 750);
    }
    return spoken;
  }, [restartWakeListening, transitionTo]);

  const executeAction = useCallback((action: CommandAction) => {
    switch (action.type) {
      case "navigate":
        setTimeout(() => router.push(action.path), 650);
        break;
      case "start-session":
        startTimer();
        break;
      case "pause-session":
        pauseTimer();
        break;
      case "stop-session": {
        const currentTimer = timerRef.current;
        const elapsed = currentTimer.accumulated + (currentTimer.running && currentTimer.startedAt ? Date.now() - currentTimer.startedAt : 0);
        stopTimer();
        if (elapsed >= 1000) {
          const phase = currentPhase(dataRef.current);
          addSession({
            id: createId(),
            date: new Date().toISOString().slice(0, 10),
            duration: Math.max(1, Math.round(elapsed / 60000)),
            area: phase.area,
            phaseId: phase.id,
            note: "Sessione registrata da Jarvis",
          });
        }
        break;
      }
      case "none":
      case "log-study-time":
        break;
    }
  }, [addSession, pauseTimer, router, startTimer, stopTimer]);

  const processCommand = useCallback(async (input: string) => {
    if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
    wakeFromInterimRef.current = false;
    setStatus((current) => ({ ...current, transcript: input, error: null }));
    transitionTo("processing");
    const context = commandContext();
    const match = matchCommand(input, context);
    if (!match) {
      const settings = dataRef.current.settings.jarvis;
      playJarvisSound("error", settings.sounds, settings.voiceVolume);
      await speak(unknownCommandResponse);
      return;
    }
    const execution = match.command.handler(context, input);
    const response = match.command.responseBuilder(context, execution);
    if (execution.requiresConfirmation && execution.action.type === "log-study-time") {
      setPendingLog(execution.action.payload);
      await speak(response, false);
      transitionTo("idle");
      return;
    }
    executeAction(execution.action);
    await speak(response);
  }, [commandContext, executeAction, speak, transitionTo]);

  const beginCommandListening = useCallback((inlineCommand = "", detectedFromInterim = false) => {
    const settings = dataRef.current.settings.jarvis;
    if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
    wakeFromInterimRef.current = detectedFromInterim;
    transitionTo("awakening");
    playJarvisSound("wake", settings.sounds, settings.voiceVolume);
    suppressRestartRef.current = false;
    setMode("command");
    sequenceTimerRef.current = setTimeout(() => {
      transitionTo("listening");
      playJarvisSound("listening", settings.sounds, settings.voiceVolume);
      if (inlineCommand) void processCommand(inlineCommand);
      else {
        commandTimerRef.current = setTimeout(() => {
          if (!activeRef.current || modeRef.current !== "command") return;
          wakeFromInterimRef.current = false;
          setMode("wake");
          transitionTo("idle");
          setStatus((current) => ({ ...current, transcript: "", response: "I did not hear a command. Say the wake phrase to try again." }));
        }, 9000);
      }
    }, 420);
  }, [processCommand, setMode, transitionTo]);

  const handleFinalRef = useRef<(transcript: string) => void>(() => undefined);
  handleFinalRef.current = (transcript) => {
    setStatus((current) => ({ ...current, transcript }));
    if (modeRef.current === "wake") {
      const wake = parseWakePhrase(transcript, dataRef.current.settings.jarvis.wakePhrase);
      if (wake.detected) beginCommandListening(wake.command);
      return;
    }
    if (modeRef.current === "command") {
      if (wakeFromInterimRef.current) {
        wakeFromInterimRef.current = false;
        const wake = parseWakePhrase(transcript, dataRef.current.settings.jarvis.wakePhrase);
        if (wake.detected) {
          if (wake.command) void processCommand(wake.command);
          return;
        }
      }
      void processCommand(transcript);
    }
  };

  useEffect(() => {
    const supported = BrowserSpeechRecognition.isSupported();
    const synthesisSupported = BrowserSpeechSynthesis.isSupported();
    synthesisRef.current = synthesisSupported ? new BrowserSpeechSynthesis() : null;
    setStatus((current) => ({ ...current, supported, synthesisSupported }));
    if (!supported) return;

    recognitionRef.current = new BrowserSpeechRecognition({
      onInterim: (transcript) => {
        setStatus((current) => ({ ...current, transcript }));
        if (modeRef.current !== "wake") return;
        const wake = parseWakePhrase(transcript, dataRef.current.settings.jarvis.wakePhrase);
        if (wake.detected) beginCommandListening("", true);
      },
      onFinal: (transcript) => handleFinalRef.current(transcript),
      onError: (error, fatal) => {
        setStatus((current) => ({ ...current, error, active: fatal ? false : current.active }));
        if (fatal) {
          const settings = dataRef.current.settings.jarvis;
          playJarvisSound("error", settings.sounds, settings.voiceVolume);
          activeRef.current = false;
          setMode("off");
          transitionTo("error", "idle", 1800);
        }
      },
      onEnd: () => {
        if (!activeRef.current || suppressRestartRef.current || speakingRef.current) return;
        restartTimerRef.current = setTimeout(() => recognitionRef.current?.start(), 280);
      },
    });
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
      activeRef.current = false;
      recognitionRef.current?.destroy();
      synthesisRef.current?.cancel();
    };
  }, [beginCommandListening, setMode, transitionTo]);

  useEffect(() => {
    if (!booted || greetingSentRef.current) return;
    greetingSentRef.current = true;
    setStatus((current) => ({ ...current, response: `${welcomeMessage} ${buildWelcomeContext(telemetry)}` }));
    void speak(welcomeMessage, false).then((spoken) => { greetingSpokenRef.current = spoken; });
  }, [booted, speak, telemetry]);

  const activate = useCallback(async () => {
    if (!status.supported) return;
    if (!greetingSpokenRef.current && status.synthesisSupported) {
      greetingSpokenRef.current = await speak(welcomeMessage, false);
    }
    activeRef.current = true;
    suppressRestartRef.current = false;
    setStatus((current) => ({
      ...current,
      active: true,
      error: null,
      response: `Listening for “${dataRef.current.settings.jarvis.wakePhrase}”.`,
    }));
    setMode("wake");
    transitionTo("idle");
    recognitionRef.current?.start();
  }, [setMode, speak, status.supported, status.synthesisSupported, transitionTo]);

  const deactivate = useCallback(() => {
    activeRef.current = false;
    suppressRestartRef.current = true;
    if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
    wakeFromInterimRef.current = false;
    recognitionRef.current?.abort();
    synthesisRef.current?.cancel();
    setMode("off");
    setStatus((current) => ({ ...current, active: false, transcript: "", response: "Voice system disabled." }));
    transitionTo("idle");
  }, [setMode, transitionTo]);

  const confirmLog = useCallback(async () => {
    if (!pendingLog) return;
    addSession({
      id: createId(),
      date: new Date().toISOString().slice(0, 10),
      duration: pendingLog.duration,
      area: pendingLog.area,
      note: `Registrazione vocale · ${pendingLog.categoryLabel}`,
    });
    setPendingLog(null);
    await speak("Study time saved.");
  }, [addSession, pendingLog, speak]);

  const cancelLog = useCallback(async () => {
    setPendingLog(null);
    await speak("Entry cancelled.");
  }, [speak]);

  return { status, pendingLog, activate, deactivate, confirmLog, cancelLog };
}

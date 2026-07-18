"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, ArrowLeft, CheckCircle2, Clock3, Flame, FolderKanban, Gauge, Layers3, Sparkles, Target } from "lucide-react";
import { useApp } from "@/lib/store";
import { createJarvisTelemetry } from "../services/telemetry";
import { fadeUp, staggerContainer, stateDefinitions } from "../animations/motion";
import { JARVIS_STATES } from "../types/jarvis";
import { useJarvisState } from "../hooks/use-jarvis-state";
import { useJarvisVoice } from "../hooks/use-jarvis-voice";
import { BootSequence } from "./boot-sequence";
import { HudCard } from "../ui/hud-card";
import { JarvisOrb } from "../ui/jarvis-orb";
import { VoiceConsole } from "../ui/voice-console";
import { playJarvisSound } from "../speech/activation-sound";
import "../jarvis.css";

export function CommandCenter() {
  const { data } = useApp();
  const [booted, setBooted] = useState(data.settings.reduceMotion);
  const { state, transitionTo } = useJarvisState();
  const voice = useJarvisVoice({ booted, transitionTo });
  const telemetry = useMemo(() => createJarvisTelemetry(data), [data]);
  const bootSoundPlayed = useRef(false);
  const animationsEnabled = data.settings.jarvis.animations && !data.settings.reduceMotion;

  useEffect(() => {
    if (!booted || bootSoundPlayed.current) return;
    bootSoundPlayed.current = true;
    playJarvisSound("boot", data.settings.jarvis.sounds, data.settings.jarvis.voiceVolume);
  }, [booted, data.settings.jarvis.sounds, data.settings.jarvis.voiceVolume]);

  return (
    <div className="jarvis-shell">
      {!booted && <BootSequence onComplete={() => setBooted(true)}/>}
      <AnimatePresence>
          <motion.div className="jarvis-command-center" initial={false} data-jarvis-state={state} data-animations={animationsEnabled ? "on" : "off"}>
            <header className="jarvis-header">
              <Link href="/" className="jarvis-back"><ArrowLeft size={17}/><span>MakerPath</span></Link>
              <div className="jarvis-system-title"><span className="jarvis-system-dot"/>Command Center <small>CORE 01</small></div>
              <div className="jarvis-header-time">{new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</div>
            </header>

            <aside className="jarvis-side-panel" aria-label="Stati del sistema">
              <p>System state</p>
              {JARVIS_STATES.map((item) => (
                <button
                  key={item}
                  className={state === item ? "active" : ""}
                  onClick={() => transitionTo(item, item === "idle" ? undefined : "idle", item === "processing" ? 2200 : 1600)}
                  aria-pressed={state === item}
                >
                  <span style={{ background: stateDefinitions[item].color }}/>{stateDefinitions[item].label}
                </button>
              ))}
              <div className="jarvis-side-meta"><span>Interface</span><strong>Online</strong><span>Data source</span><strong>Local</strong></div>
            </aside>

            <main className="jarvis-workspace">
              <motion.section className="jarvis-primary-hud" variants={staggerContainer} initial={false} animate="visible">
                <motion.div className="jarvis-orb-column" variants={fadeUp}>
                  <p className="jarvis-kicker">JARVIS CORE</p>
                  <JarvisOrb state={state} animationsEnabled={animationsEnabled}/>
                  <div className="jarvis-core-caption">
                    <span>{state === "listening" ? "In ascolto..." : stateDefinitions[state].label}</span>
                    <p>Systems nominal · Local telemetry connected</p>
                  </div>
                  <VoiceConsole
                    status={voice.status}
                    pendingLog={voice.pendingLog}
                    onActivate={voice.activate}
                    onDeactivate={voice.deactivate}
                    onConfirm={voice.confirmLog}
                    onCancel={voice.cancelLog}
                    wakePhrase={data.settings.jarvis.wakePhrase}
                  />
                </motion.div>

                <div className="jarvis-hud-grid jarvis-left-hud">
                  <HudCard label="Experience" value={`${telemetry.xp} XP`} icon={Sparkles} accent/>
                  <HudCard label={`Level ${telemetry.levelNumber}`} value={telemetry.levelName} icon={Gauge}/>
                  <HudCard label="Roadmap" value={`${telemetry.roadmapProgress}%`} icon={Layers3}/>
                  <HudCard label="Streak" value={`${telemetry.streak} giorni`} icon={Flame}/>
                </div>

                <div className="jarvis-hud-grid jarvis-right-hud">
                  <HudCard label="Questa settimana" value={`${telemetry.weekHours.toFixed(1)} ore`} icon={Clock3} accent/>
                  <HudCard label="Task completati" value={telemetry.completedTasks} icon={CheckCircle2}/>
                  <HudCard label="Progetto attivo" value={telemetry.activeProject} icon={FolderKanban}/>
                  <HudCard label="Missione corrente" value={telemetry.currentMission} icon={Target}/>
                </div>
              </motion.section>

              <motion.footer className="jarvis-status-strip" variants={fadeUp} initial={false} animate="visible">
                <span><Activity size={13}/>Live telemetry</span>
                <span>Storage · synchronized</span>
                <span>Motion · {animationsEnabled ? "enabled" : "reduced"}</span>
                <span>Voice · {voice.status.supported ? voice.status.active ? "listening" : "ready" : "unavailable"}</span>
                <span className="jarvis-status-ready">Ready</span>
              </motion.footer>
            </main>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}

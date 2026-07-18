"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Save } from "lucide-react";
import { useApp } from "@/lib/store";
import { createId } from "@/lib/id";
import type { Area } from "@/lib/types";
import { Drawer } from "./ui";

export function StudyTimer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { timer, startTimer, pauseTimer, stopTimer, addSession, data } = useApp();
  const [now, setNow] = useState(Date.now());
  const [area, setArea] = useState<Area>("Software");
  const [phaseId, setPhaseId] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timer.running]);
  const elapsed = timer.accumulated + (timer.running && timer.startedAt ? now - timer.startedAt : 0);
  const format = (ms: number) => `${String(Math.floor(ms / 3600000)).padStart(2,"0")}:${String(Math.floor(ms / 60000) % 60).padStart(2,"0")}:${String(Math.floor(ms / 1000) % 60).padStart(2,"0")}`;
  const save = () => {
    const ms = stopTimer();
    if (ms < 1000) return;
    addSession({ id: createId(), date: new Date().toISOString().slice(0,10), duration: Math.max(1, Math.round(ms / 60000)), area, phaseId: phaseId || undefined, note });
    setNote(""); onClose();
  };
  return <Drawer open={open} onClose={onClose} title="Sessione di studio">
    <div style={{ textAlign:"center", padding:"18px 0 28px" }}><p className="muted">Tempo concentrato</p><div style={{font:"650 clamp(42px,14vw,68px) var(--font-mono)",letterSpacing:"-.07em"}}>{format(elapsed)}</div></div>
    <div className="actions" style={{justifyContent:"center",marginBottom:24}}>
      <button className="btn primary" onClick={timer.running ? pauseTimer : startTimer}>{timer.running ? <Pause size={17}/> : <Play size={17}/>} {timer.running ? "Pausa" : "Start"}</button>
      <button className="btn" onClick={() => { stopTimer(); }} disabled={!elapsed}><RotateCcw size={17}/>Reset</button>
    </div>
    <div className="form">
      <div className="form-grid"><label className="field-wrap">Area<select className="field" value={area} onChange={(e)=>setArea(e.target.value as Area)}>{["Software","Hardware","Design","AI"].map(x=><option key={x}>{x}</option>)}</select></label><label className="field-wrap">Fase<select className="field" value={phaseId} onChange={(e)=>setPhaseId(e.target.value)}><option value="">Nessuna</option>{data.phases.map(p=><option key={p.id} value={p.id}>{p.order}. {p.title}</option>)}</select></label></div>
      <label className="field-wrap">Nota<textarea className="field" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Cosa hai costruito o imparato?"/></label>
      <button className="btn primary" onClick={save} disabled={!elapsed}><Save size={17}/>Salva sessione</button>
    </div>
  </Drawer>;
}

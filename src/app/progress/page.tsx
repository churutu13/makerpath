"use client";

import { Award, CheckCircle2, Clock3, Flame, FolderCheck, Medal, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { createId } from "@/lib/id";
import { completedTasks, getLevel, getStreak, getXP, phaseProgress, totalMinutes } from "@/lib/stats";
import type { Area } from "@/lib/types";
import { Drawer, PageHead, ProgressBar } from "@/components/ui";

export default function ProgressPage(){
  const {data,addSession}=useApp(); const [sessionOpen,setSessionOpen]=useState(false);
  const xp=getXP(data),level=getLevel(xp),minutes=totalMinutes(data);
  const stats=[["XP totali",xp,Sparkles],["Ore studiate",(minutes/60).toFixed(1),Clock3],["Task completati",completedTasks(data),CheckCircle2],["Progetti completi",data.projects.filter(p=>p.status==="Completato").length,FolderCheck],["Fasi complete",data.phases.filter(p=>phaseProgress(p)===100).length,Award],["Streak",`${getStreak(data)} gg`,Flame]];
  const daily=Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()-(6-i));const key=date.toISOString().slice(0,10);return {label:["D","L","M","M","G","V","S"][date.getDay()],value:data.sessions.filter(s=>s.date===key).reduce((a,s)=>a+s.duration,0)}});
  const max=Math.max(...daily.map(d=>d.value),60);
  const areas=(["Software","Hardware","Design","AI"] as Area[]).map(area=>({area,minutes:data.sessions.filter(s=>s.area===area).reduce((a,s)=>a+s.duration,0)}));
  const heat=Array.from({length:56},(_,i)=>{const date=new Date();date.setDate(date.getDate()-(55-i));const value=data.sessions.filter(s=>s.date===date.toISOString().slice(0,10)).reduce((a,s)=>a+s.duration,0);return value});
  return <><PageHead eyebrow="Il tuo segnale" title="Progressi" description="Una lettura essenziale del tempo investito e delle competenze sbloccate." action={<button className="btn primary" onClick={()=>setSessionOpen(true)}><Plus size={17}/>Sessione</button>}/>
    <section className="card mission" style={{marginBottom:14}}><div className="phase-top"><div><p className="eyebrow">Level {level.number}</p><h2>{level.name}</h2></div><Medal color="var(--accent)" size={28}/></div><div className="progress-row" style={{marginTop:24}}><span>{xp} XP</span><span>{level.next?`${level.next.min} XP`:"MAX"}</span></div><ProgressBar value={level.progress}/></section>
    <section className="grid stats-grid">{stats.map(([label,value,Icon])=>{const C=Icon as typeof Sparkles;return <article className="card stat" key={String(label)}><C className="stat-icon" size={19}/><div><div className="stat-value">{String(value)}</div><div className="stat-label">{String(label)}</div></div></article>})}</section>
    <section className="section grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
      <article className="card"><p className="eyebrow">Ultimi 7 giorni</p><h2>Ritmo settimanale</h2><div className="chart">{daily.map((d,i)=><div className="bar-wrap" key={i}><div className="bar" style={{height:`${Math.max(3,d.value/max*100)}%`}} title={`${d.value} min`}/><span>{d.label}</span></div>)}</div></article>
      <article className="card"><p className="eyebrow">Distribuzione</p><h2>Tempo per area</h2><div className="list" style={{marginTop:20}}>{areas.map(a=><div key={a.area}><div className="progress-row"><span>{a.area}</span><span>{a.minutes} min</span></div><ProgressBar value={minutes?a.minutes/minutes*100:0}/></div>)}</div></article>
    </section>
    <section className="section card"><div className="section-head"><div><p className="eyebrow">Attività</p><h2>Ultime 8 settimane</h2></div><span className="muted" style={{fontSize:11}}>meno → più</span></div><div className="heatmap">{heat.map((v,i)=><span key={i} className={`heat ${v>90?"l3":v>45?"l2":v>0?"l1":""}`} title={`${v} minuti`}/>)}</div></section>
    <section className="section"><div className="section-head"><div><p className="eyebrow">Milestone</p><h2>Achievement</h2></div></div><div className="grid project-grid">{data.achievements.map((a)=>{const unlocked=a.unlocked||(a.id==="first-step"&&completedTasks(data)>0);return <article className={`card achievement ${unlocked?"unlocked":""}`} key={a.id}><span className="badge"><Award size={19}/></span><div><h3 style={{marginBottom:4}}>{a.title}</h3><p className="muted" style={{fontSize:11,margin:0}}>{a.description}</p></div></article>})}</div></section>
    <SessionForm open={sessionOpen} onClose={()=>setSessionOpen(false)} onSave={(session)=>{addSession(session);setSessionOpen(false)}}/>
  </>;
}
function SessionForm({open,onClose,onSave}:{open:boolean;onClose:()=>void;onSave:(s:Parameters<ReturnType<typeof useApp>["addSession"]>[0])=>void}){
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [duration,setDuration]=useState(60);const [area,setArea]=useState<Area>("Software");const [note,setNote]=useState("");
  return <Drawer open={open} onClose={onClose} title="Registra sessione"><form className="form" onSubmit={e=>{e.preventDefault();onSave({id:createId(),date,duration,area,note})}}>
    <div className="form-grid"><label className="field-wrap">Data<input required type="date" className="field" value={date} onChange={e=>setDate(e.target.value)}/></label><label className="field-wrap">Durata (min)<input required min="1" type="number" className="field" value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label></div>
    <label className="field-wrap">Area<select className="field" value={area} onChange={e=>setArea(e.target.value as Area)}>{["Software","Hardware","Design","AI"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="field-wrap">Nota<textarea className="field" value={note} onChange={e=>setNote(e.target.value)} placeholder="Cosa hai fatto?"/></label><button className="btn primary">Salva sessione</button>
  </form></Drawer>;
}

"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock3, Cpu, Flame, FolderCheck, Play, Target, Timer } from "lucide-react";
import { useApp } from "@/lib/store";
import { completedTasks, currentPhase, getLevel, getStreak, getXP, overallProgress, phaseProgress, totalMinutes, weekMinutes } from "@/lib/stats";
import { ProgressBar } from "@/components/ui";
import { useState } from "react";
import { StudyTimer } from "@/components/study-timer";

export default function Home() {
  const { data, toggleTask } = useApp();
  const [timerOpen, setTimerOpen] = useState(false);
  const xp = getXP(data), level = getLevel(xp), phase = currentPhase(data), progress = phaseProgress(phase);
  const nextTasks = data.phases.flatMap((item) => item.tasks.map((task) => ({...task, phase:item}))).filter((item) => !item.completed).slice(0,4);
  const mission = nextTasks[0];
  const weekly = weekMinutes(data), weeklyGoal = data.settings.weeklyGoal * 60;
  const stats = [
    { label:"Task completati", value:completedTasks(data), icon:Check },
    { label:"Progetti conclusi", value:data.projects.filter(p=>p.status==="Completato").length, icon:FolderCheck },
    { label:"Streak attuale", value:`${getStreak(data)} gg`, icon:Flame },
    { label:"Tempo totale", value:`${(totalMinutes(data)/60).toFixed(1)}h`, icon:Clock3 },
  ];
  return <>
    <header className="page-head"><div><p className="eyebrow">Sabato, 18 luglio</p><h1>Continua a costruire.</h1><p className="muted">Ogni piccolo circuito, commit e prototipo ti porta più vicino.</p></div><button className="btn icon-btn" onClick={()=>setTimerOpen(true)} aria-label="Avvia timer"><Timer size={19}/></button></header>
    <section className="hero-grid">
      <article className="card mission">
        <div className="phase-top"><div><p className="eyebrow">Current mission</p><h2>{mission?.title ?? "Percorso completato"}</h2><p className="muted">{mission ? `Fase ${mission.phase.order} · ${mission.phase.title}` : "Hai completato tutte le attività."}</p></div><span className="tag">{mission?.difficulty}</span></div>
        {mission && <><div className="tags" style={{margin:"22px 0"}}><span className="tag">{mission.phase.area}</span><span className="tag">{mission.duration} min</span></div><div className="progress-row"><span>Fase attuale</span><span>{progress}%</span></div><ProgressBar value={progress}/><div className="actions" style={{marginTop:22}}><button className="btn primary" onClick={()=>toggleTask(mission.phase.id,mission.id)}><Play size={16}/>Completa attività</button><Link className="btn ghost" href={`/roadmap?phase=${mission.phase.id}`}>Apri fase<ArrowRight size={16}/></Link></div></>}
      </article>
      <article className="card">
        <p className="eyebrow">Level {level.number}</p><h2>{level.name}</h2><div style={{display:"flex",alignItems:"baseline",gap:6,margin:"23px 0 9px"}}><span className="stat-value">{xp.toLocaleString("it-IT")}</span><span className="muted" style={{fontSize:12}}>XP</span></div><ProgressBar value={level.progress}/><p className="muted" style={{fontSize:12,margin:"10px 0 23px"}}>{level.next ? `${level.next.min-xp} XP al prossimo livello` : "Livello massimo raggiunto"}</p>
        <div className="progress-row"><span>Percorso complessivo</span><span>{overallProgress(data)}%</span></div><ProgressBar value={overallProgress(data)}/>
      </article>
    </section>
    <Link href="/command-center" className="card hover" style={{display:"flex",alignItems:"center",gap:16,marginBottom:28,padding:18}}>
      <span className="brand-mark" style={{width:44,height:44,flex:"0 0 auto"}}><Cpu size={20}/></span>
      <span style={{minWidth:0,flex:1}}><span className="eyebrow" style={{display:"block",marginBottom:4}}>MakerPath OS</span><strong style={{display:"block",fontSize:16}}>Apri Command Center</strong><span className="muted" style={{fontSize:12}}>Jarvis Core · Telemetria in tempo reale</span></span>
      <ArrowRight size={18} color="var(--muted)"/>
    </Link>
    <section className="grid stats-grid">{stats.map(({label,value,icon:Icon})=><article className="card stat" key={label}><Icon className="stat-icon" size={19}/><div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div></article>)}</section>
    <section className="section grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))"}}>
      <div><div className="section-head"><div><p className="eyebrow">In coda</p><h2>Next up</h2></div><Link className="btn ghost" href="/roadmap">Roadmap<ArrowRight size={15}/></Link></div><div className="list">{nextTasks.slice(1,4).map((item,i)=><div className="row" key={item.id}><span className="phase-number">0{i+2}</span><div className="row-main"><p className="row-title">{item.title}</p><p className="row-meta">{item.phase.shortTitle} · {item.duration} min</p></div><button className="check" onClick={()=>toggleTask(item.phase.id,item.id)} aria-label="Completa"><Check size={14}/></button></div>)}</div></div>
      <div><div className="section-head"><div><p className="eyebrow">Questa settimana</p><h2>Obiettivo {data.settings.weeklyGoal} ore</h2></div><Target color="var(--accent)" size={21}/></div><article className="card"><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:14}}><span className="stat-value">{(weekly/60).toFixed(1)}h</span><span className="muted">{Math.round(Math.min(weekly/weeklyGoal,1)*100)}%</span></div><ProgressBar value={weeklyGoal ? weekly/weeklyGoal*100 : 0}/><p className="muted" style={{fontSize:12,margin:"15px 0 0"}}>{weekly >= weeklyGoal ? "Obiettivo raggiunto. Ottimo ritmo." : `Ancora ${((weeklyGoal-weekly)/60).toFixed(1)} ore per chiudere la settimana.`}</p></article></div>
    </section>
    <StudyTimer open={timerOpen} onClose={()=>setTimerOpen(false)}/>
  </>;
}

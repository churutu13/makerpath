"use client";

import { useEffect, useState } from "react";
import { Check, ChevronRight, Clock3, LockKeyhole, Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { createId } from "@/lib/id";
import { phaseProgress } from "@/lib/stats";
import type { Difficulty, Phase, Task } from "@/lib/types";
import { Drawer, PageHead, ProgressBar } from "@/components/ui";

export default function RoadmapPage() {
  const { data, toggleTask, saveTask, deleteTask, updatePhase } = useApp();
  const [selected, setSelected] = useState<Phase | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("phase");
    if (id) setSelected(data.phases.find((phase)=>phase.id===id) ?? null);
  }, [data.phases]);
  useEffect(() => {
    if (!selected) return;
    const updated = data.phases.find((phase)=>phase.id===selected.id) ?? null;
    if (updated !== selected) setSelected(updated);
  }, [data.phases, selected]);
  const currentIndex = data.phases.findIndex((phase)=>phaseProgress(phase)<100);
  const status = (phase: Phase) => phaseProgress(phase)===100 ? "Completata" : phase.order-1===currentIndex ? "In corso" : phase.order-1<currentIndex ? "Disponibile" : "Bloccata";
  return <>
    <PageHead eyebrow="10 fasi · 319 ore" title="La tua roadmap" description="Un percorso verticale dal primo commit al primo prodotto reale."/>
    <div className="roadmap">{data.phases.map((phase)=>{
      const progress=phaseProgress(phase), state=status(phase);
      return <article key={phase.id} className={`card hover phase ${state==="In corso"?"active":""} ${state==="Bloccata"?"locked":""}`}>
        <span className="phase-dot"/><button onClick={()=>setSelected(phase)} style={{all:"unset",display:"block",width:"100%",cursor:"pointer"}}>
          <div className="phase-top"><div><p className="phase-number">FASE {String(phase.order).padStart(2,"0")} · {state}</p><h2 style={{marginTop:8}}>{phase.title}</h2></div>{state==="Bloccata"?<LockKeyhole size={17}/>:<ChevronRight size={20}/>}</div>
          <p className="muted" style={{fontSize:13,lineHeight:1.55}}>{phase.description}</p>
          <div className="tags" style={{margin:"15px 0"}}><span className="tag"><Clock3 size={11}/> {phase.hours}h</span><span className="tag">{phase.tasks.length} moduli</span><span className="tag">{phase.area}</span></div>
          <div className="progress-row"><span>{phase.tasks.filter(t=>t.completed).length} di {phase.tasks.length}</span><span>{progress}%</span></div><ProgressBar value={progress}/>
        </button>
      </article>;
    })}</div>
    <Drawer open={!!selected} onClose={()=>setSelected(null)} title={selected?.title ?? "Dettaglio fase"}>
      {selected && <div>
        <p className="muted" style={{lineHeight:1.6}}>{selected.description}</p>
        <div className="progress-row"><span>Progresso fase</span><span>{phaseProgress(selected)}%</span></div><ProgressBar value={phaseProgress(selected)}/>
        <div className="section"><p className="eyebrow">Competenze</p><div className="tags">{selected.skills.map(skill=><span className="tag" key={skill}>{skill}</span>)}</div></div>
        <div className="section"><div className="section-head"><div><p className="eyebrow">Moduli & task</p><h2>{selected.tasks.length} attività</h2></div><button className="btn icon-btn" aria-label="Aggiungi task" onClick={()=>setEditing({id:createId(),title:"",duration:60,difficulty:"Base",completed:false})}><Plus size={18}/></button></div>
          <div className="list">{selected.tasks.map(task=><div className="row" key={task.id}><button className={`check ${task.completed?"done":""}`} onClick={()=>toggleTask(selected.id,task.id)}>{task.completed&&<Check size={15}/>}</button><div className="row-main"><p className="row-title">{task.title}</p><p className="row-meta">{task.difficulty} · {task.duration} min</p></div><button className="btn icon-btn ghost" onClick={()=>setEditing(task)} aria-label="Modifica"><Pencil size={15}/></button></div>)}</div>
        </div>
        <div className="section card"><p className="eyebrow">Progetto finale</p><h3>{selected.finalProject}</h3><p className="muted" style={{fontSize:12,margin:0}}>Prerequisiti: {selected.prerequisites.join(", ")}</p></div>
        <div className="section"><label className="field-wrap">Note personali<textarea className="field" value={selected.notes} onChange={(e)=>updatePhase({...selected,notes:e.target.value})} placeholder="Decisioni, dubbi, link e idee..."/></label></div>
      </div>}
    </Drawer>
    <TaskEditor task={editing} onClose={()=>setEditing(null)} onSave={(task)=>{ if(selected) saveTask(selected.id,task); setEditing(null); }} onDelete={(task)=>{if(selected&&confirm("Eliminare questa attività?")) deleteTask(selected.id,task.id); setEditing(null);}}/>
  </>;
}

function TaskEditor({task,onClose,onSave,onDelete}:{task:Task|null;onClose:()=>void;onSave:(t:Task)=>void;onDelete:(t:Task)=>void}) {
  const [draft,setDraft]=useState<Task|null>(null);
  useEffect(()=>setDraft(task),[task]);
  return <Drawer open={!!task} onClose={onClose} title="Modifica attività">{draft&&<form className="form" onSubmit={(e)=>{e.preventDefault();if(draft.title.trim())onSave(draft)}}>
    <label className="field-wrap">Titolo<input required className="field" value={draft.title} onChange={(e)=>setDraft({...draft,title:e.target.value})}/></label>
    <div className="form-grid"><label className="field-wrap">Durata (min)<input required min="1" type="number" className="field" value={draft.duration} onChange={(e)=>setDraft({...draft,duration:Number(e.target.value)})}/></label><label className="field-wrap">Difficoltà<select className="field" value={draft.difficulty} onChange={(e)=>setDraft({...draft,difficulty:e.target.value as Difficulty})}>{["Base","Intermedia","Avanzata"].map(x=><option key={x}>{x}</option>)}</select></label></div>
    <div className="actions"><button className="btn primary" type="submit">Salva attività</button><button className="btn danger" type="button" onClick={()=>onDelete(draft)}><Trash2 size={16}/>Elimina</button></div>
  </form>}</Drawer>;
}

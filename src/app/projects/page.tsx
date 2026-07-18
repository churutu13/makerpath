"use client";

import { useEffect, useState } from "react";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { createId } from "@/lib/id";
import type { Area, Difficulty, Project, ProjectStatus } from "@/lib/types";
import { Drawer, PageHead, ProgressBar } from "@/components/ui";

const blank = (): Project => ({id:createId(),title:"",description:"",category:"Hardware",difficulty:"Base",status:"Da iniziare",progress:0,startDate:"",phaseId:"phase-1",skills:[],components:[],estimatedCost:0,notes:"",checklist:[]});

export default function ProjectsPage() {
  const {data,saveProject,deleteProject}=useApp();
  const [filter,setFilter]=useState("Tutti");
  const [editing,setEditing]=useState<Project|null>(null);
  const filtered=data.projects.filter(p=>filter==="Tutti"||p.status===filter||p.category===filter);
  return <>
    <PageHead eyebrow={`${data.projects.length} esperimenti`} title="Progetti" description="Dove le competenze diventano oggetti, prototipi e prodotti." action={<button className="btn primary" onClick={()=>setEditing(blank())}><Plus size={17}/>Nuovo</button>}/>
    <div className="filterbar">{["Tutti","Da iniziare","In corso","Completato","Software","Hardware","Design","AI"].map(item=><button key={item} className={`filter ${filter===item?"active":""}`} onClick={()=>setFilter(item)}>{item}</button>)}</div>
    <div className="grid project-grid">{filtered.map(project=><article className="card hover project-card" key={project.id} onClick={()=>setEditing(project)}>
      <div className="project-top"><span className="tag">{project.category}</span><span className="tag">{project.status}</span></div><div style={{margin:"22px 0"}}><h2>{project.title}</h2><p className="muted" style={{fontSize:13,lineHeight:1.5}}>{project.description}</p></div>
      <div className="tags" style={{marginBottom:18}}><span className="tag">{project.difficulty}</span><span className="tag">Fase {project.phaseId.replace("phase-","")}</span>{project.estimatedCost>0&&<span className="tag cost">€{project.estimatedCost}</span>}</div>
      <div className="progress-row"><span>Progresso</span><span>{project.progress}%</span></div><ProgressBar value={project.progress}/>
    </article>)}</div>
    {!filtered.length&&<div className="empty"><Boxes size={25}/><p style={{margin:"12px 0 0"}}>Nessun progetto in questa vista.</p></div>}
    <ProjectEditor value={editing} phases={data.phases.map(p=>({id:p.id,title:p.title}))} onClose={()=>setEditing(null)} onSave={(p)=>{saveProject(p);setEditing(null)}} onDelete={(id)=>{if(confirm("Eliminare definitivamente il progetto?"))deleteProject(id);setEditing(null)}}/>
  </>;
}

function ProjectEditor({value,phases,onClose,onSave,onDelete}:{value:Project|null;phases:{id:string,title:string}[];onClose:()=>void;onSave:(p:Project)=>void;onDelete:(id:string)=>void}) {
  const [draft,setDraft]=useState<Project|null>(null); useEffect(()=>setDraft(value),[value]);
  return <Drawer open={!!value} onClose={onClose} title={value?.title||"Nuovo progetto"}>{draft&&<form className="form" onSubmit={(e)=>{e.preventDefault();if(draft.title.trim())onSave(draft)}}>
    <label className="field-wrap">Titolo<input required className="field" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
    <label className="field-wrap">Descrizione<textarea className="field" value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
    <div className="form-grid"><label className="field-wrap">Area<select className="field" value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as Area})}>{["Software","Hardware","Design","AI"].map(x=><option key={x}>{x}</option>)}</select></label><label className="field-wrap">Difficoltà<select className="field" value={draft.difficulty} onChange={e=>setDraft({...draft,difficulty:e.target.value as Difficulty})}>{["Base","Intermedia","Avanzata"].map(x=><option key={x}>{x}</option>)}</select></label></div>
    <div className="form-grid"><label className="field-wrap">Stato<select className="field" value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as ProjectStatus,progress:e.target.value==="Completato"?100:draft.progress})}>{["Da iniziare","In corso","Completato"].map(x=><option key={x}>{x}</option>)}</select></label><label className="field-wrap">Progresso %<input className="field" min="0" max="100" type="number" value={draft.progress} onChange={e=>setDraft({...draft,progress:Number(e.target.value)})}/></label></div>
    <label className="field-wrap">Fase<select className="field" value={draft.phaseId} onChange={e=>setDraft({...draft,phaseId:e.target.value})}>{phases.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    <div className="form-grid"><label className="field-wrap">Data inizio<input className="field" type="date" value={draft.startDate} onChange={e=>setDraft({...draft,startDate:e.target.value})}/></label><label className="field-wrap">Costo stimato €<input className="field" min="0" type="number" value={draft.estimatedCost} onChange={e=>setDraft({...draft,estimatedCost:Number(e.target.value)})}/></label></div>
    <label className="field-wrap">Componenti, separati da virgola<input className="field" value={draft.components.join(", ")} onChange={e=>setDraft({...draft,components:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})}/></label>
    <label className="field-wrap">Note<textarea className="field" value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>
    <div className="actions"><button className="btn primary" type="submit">Salva progetto</button><button className="btn danger" type="button" onClick={()=>onDelete(draft.id)}><Trash2 size={16}/>Elimina</button></div>
  </form>}</Drawer>;
}

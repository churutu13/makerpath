"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Heart, Plus, Search, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { createId } from "@/lib/id";
import type { Area, Resource, ResourceType } from "@/lib/types";
import { Drawer, PageHead, ProgressBar } from "@/components/ui";

const blank = ():Resource=>({id:createId(),title:"",type:"Corso",area:"Software",phaseId:"phase-1",paid:false,status:"Da iniziare",rating:0,notes:"",progress:0,favorite:false});

export default function ResourcesPage(){
  const {data,saveResource,deleteResource}=useApp(); const [query,setQuery]=useState(""); const [filter,setFilter]=useState("Tutte"); const [editing,setEditing]=useState<Resource|null>(null);
  const shown=data.resources.filter(r=>(filter==="Tutte"||r.area===filter||filter==="Preferite"&&r.favorite)&&r.title.toLowerCase().includes(query.toLowerCase()));
  return <><PageHead eyebrow="Libreria personale" title="Risorse" description="Corsi, documentazione e riferimenti che vale la pena conservare." action={<button className="btn primary" onClick={()=>setEditing(blank())}><Plus size={17}/>Aggiungi</button>}/>
    <div className="search-wrap"><Search size={19}/><input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca nella libreria..."/></div>
    <div className="filterbar" style={{marginTop:12}}>{["Tutte","Preferite","Software","Hardware","Design","AI"].map(x=><button key={x} onClick={()=>setFilter(x)} className={`filter ${filter===x?"active":""}`}>{x}</button>)}</div>
    <div className="grid resource-grid">{shown.map(resource=><article className="card hover" key={resource.id}>
      <div className="resource-top"><span className="tag">{resource.type}</span><button className="btn icon-btn ghost" aria-label="Preferito" onClick={()=>saveResource({...resource,favorite:!resource.favorite})}><Heart size={17} fill={resource.favorite?"currentColor":"none"} color={resource.favorite?"var(--accent)":"currentColor"}/></button></div>
      <button style={{all:"unset",cursor:"pointer",display:"block",width:"100%"}} onClick={()=>setEditing(resource)}><div style={{margin:"18px 0"}}><h2>{resource.title}</h2><p className="muted" style={{fontSize:12}}>{resource.area} · Fase {resource.phaseId.replace("phase-","")} · {resource.paid?"A pagamento":"Gratuita"}</p></div><div className="progress-row"><span>{resource.status}</span><span>{resource.progress}%</span></div><ProgressBar value={resource.progress}/></button>
      {resource.url&&<a href={resource.url} target="_blank" rel="noreferrer" className="btn ghost" style={{marginTop:16,width:"100%"}}>Apri risorsa<ExternalLink size={15}/></a>}
    </article>)}</div>
    <ResourceEditor value={editing} phases={data.phases.map(p=>({id:p.id,title:p.title}))} onClose={()=>setEditing(null)} onSave={r=>{saveResource(r);setEditing(null)}} onDelete={id=>{if(confirm("Eliminare la risorsa?"))deleteResource(id);setEditing(null)}}/>
  </>;
}
function ResourceEditor({value,phases,onClose,onSave,onDelete}:{value:Resource|null;phases:{id:string,title:string}[];onClose:()=>void;onSave:(r:Resource)=>void;onDelete:(id:string)=>void}){
  const [draft,setDraft]=useState<Resource|null>(null);useEffect(()=>setDraft(value),[value]);
  return <Drawer open={!!value} onClose={onClose} title={value?.title||"Nuova risorsa"}>{draft&&<form className="form" onSubmit={e=>{e.preventDefault();if(draft.title.trim())onSave(draft)}}>
    <label className="field-wrap">Titolo<input required className="field" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
    <div className="form-grid"><label className="field-wrap">Tipo<select className="field" value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value as ResourceType})}>{["Corso","Video","Articolo","Documentazione","Libro","Repository"].map(x=><option key={x}>{x}</option>)}</select></label><label className="field-wrap">Area<select className="field" value={draft.area} onChange={e=>setDraft({...draft,area:e.target.value as Area})}>{["Software","Hardware","Design","AI"].map(x=><option key={x}>{x}</option>)}</select></label></div>
    <label className="field-wrap">URL<input className="field" type="url" value={draft.url||""} onChange={e=>setDraft({...draft,url:e.target.value})} placeholder="https://"/></label>
    <label className="field-wrap">Fase<select className="field" value={draft.phaseId} onChange={e=>setDraft({...draft,phaseId:e.target.value})}>{phases.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
    <div className="form-grid"><label className="field-wrap">Stato<select className="field" value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as Resource["status"]})}>{["Da iniziare","In corso","Completata"].map(x=><option key={x}>{x}</option>)}</select></label><label className="field-wrap">Progresso %<input className="field" type="number" min="0" max="100" value={draft.progress} onChange={e=>setDraft({...draft,progress:Number(e.target.value)})}/></label></div>
    <label className="field-wrap">Note<textarea className="field" value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>
    <div className="actions"><button className="btn primary">Salva risorsa</button><button type="button" className="btn danger" onClick={()=>onDelete(draft.id)}><Trash2 size={16}/>Elimina</button></div>
  </form>}</Drawer>;
}

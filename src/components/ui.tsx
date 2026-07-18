"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return <><div className="drawer-backdrop" onClick={onClose}/><section className="drawer" role="dialog" aria-modal="true" aria-label={title}><div className="drawer-head"><div><p className="eyebrow">MakerPath</p><h2>{title}</h2></div><button className="btn icon-btn ghost" onClick={onClose} aria-label="Chiudi"><X size={19}/></button></div>{children}</section></>;
}

export function ProgressBar({ value }: { value: number }) {
  return <div className="progress" aria-label={`${value}% completato`}><span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}/></div>;
}

export function PageHead({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <header className="page-head"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></div>{action}</header>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Boxes, Map, Settings, Sparkles, Timer } from "lucide-react";
import { useApp } from "@/lib/store";
import { useEffect, useState } from "react";
import { StudyTimer } from "./study-timer";

const links = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/projects", label: "Progetti", icon: Boxes },
  { href: "/resources", label: "Risorse", icon: BookOpen },
  { href: "/progress", label: "Progressi", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { timer } = useApp();
  const [openTimer, setOpenTimer] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer.running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer.running]);
  const elapsed = timer.accumulated + (timer.running && timer.startedAt ? now - timer.startedAt : 0);
  const format = (ms: number) => `${String(Math.floor(ms / 3600000)).padStart(2,"0")}:${String(Math.floor(ms / 60000) % 60).padStart(2,"0")}:${String(Math.floor(ms / 1000) % 60).padStart(2,"0")}`;
  return (
    <div className="app">
      <aside className="sidebar">
        <Link className="brand" href="/"><span className="brand-mark"><Sparkles size={18}/></span>MakerPath</Link>
        <nav className="side-nav">{links.map(({ href, label, icon: Icon }) => <Link key={href} className={`nav-link ${path === href ? "active" : ""}`} href={href}><Icon size={18}/>{label}</Link>)}</nav>
        <div className="side-footer"><Link className={`nav-link ${path === "/settings" ? "active" : ""}`} href="/settings"><Settings size={18}/>Impostazioni</Link></div>
      </aside>
      <main className="main">{children}</main>
      <nav className="mobile-nav" aria-label="Navigazione principale">{links.map(({ href, label, icon: Icon }) => <Link key={href} aria-label={label} className={`nav-link ${path === href ? "active" : ""}`} href={href}><Icon size={21}/></Link>)}<Link aria-label="Impostazioni" className={`nav-link ${path === "/settings" ? "active" : ""}`} href="/settings"><Settings size={21}/></Link></nav>
      {(elapsed > 0 || timer.running) && <button className="timer-pill" onClick={() => setOpenTimer(true)}><span className={timer.running ? "timer-dot" : ""}/><Timer size={15}/>{format(elapsed)}</button>}
      <StudyTimer open={openTimer} onClose={() => setOpenTimer(false)} />
    </div>
  );
}

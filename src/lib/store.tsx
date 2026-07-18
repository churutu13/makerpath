"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSeedData } from "./seed";
import type { AppData, Phase, Project, Resource, StudySession, Task, TimerState } from "./types";

const STORAGE_KEY = "makerpath:data:v1";
const TIMER_KEY = "makerpath:timer:v2";

interface AppContextValue {
  data: AppData;
  hydrated: boolean;
  timer: TimerState;
  toggleTask: (phaseId: string, taskId: string) => void;
  saveTask: (phaseId: string, task: Task) => void;
  deleteTask: (phaseId: string, taskId: string) => void;
  updatePhase: (phase: Phase) => void;
  saveProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  saveResource: (resource: Resource) => void;
  deleteResource: (id: string) => void;
  addSession: (session: StudySession) => void;
  updateSettings: (settings: Partial<AppData["settings"]>) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => number;
  resetData: () => void;
  importData: (value: unknown) => void;
  exportData: () => string;
}

const AppContext = createContext<AppContextValue | null>(null);

const validData = (value: unknown): value is AppData => {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<AppData>;
  return data.version === 3 && Array.isArray(data.phases) && Array.isArray(data.projects) && Array.isArray(data.sessions) && Boolean(data.settings?.jarvis);
};

const migrateData = (value: unknown): AppData | null => {
  if (validData(value)) return value;
  if (!value || typeof value !== "object") return null;
  const legacy = value as Partial<AppData>;
  if (![1, 2].includes(legacy.version ?? 0) || !Array.isArray(legacy.phases) || !Array.isArray(legacy.projects) || !Array.isArray(legacy.resources) || !legacy.settings) return null;
  const defaults = createSeedData().settings.jarvis;
  return {
    ...(legacy as AppData),
    version: 3,
    sessions: legacy.version === 1 ? [] : legacy.sessions ?? [],
    settings: { ...(legacy.settings as AppData["settings"]), jarvis: defaults },
  };
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(createSeedData);
  const [hydrated, setHydrated] = useState(false);
  const [timer, setTimer] = useState<TimerState>({ running: false, startedAt: null, accumulated: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        const migrated = migrateData(parsed);
        if (migrated) setData(migrated);
      }
      const storedTimer = localStorage.getItem(TIMER_KEY);
      if (storedTimer) setTimer(JSON.parse(storedTimer) as TimerState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  }, [timer, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
    document.documentElement.classList.toggle("reduce-motion", data.settings.reduceMotion);
  }, [data.settings]);

  const updatePhases = useCallback((fn: (phases: Phase[]) => Phase[]) => setData((current) => ({ ...current, phases: fn(current.phases) })), []);
  const toggleTask = useCallback((phaseId: string, taskId: string) => updatePhases((phases) => phases.map((phase) =>
    phase.id === phaseId ? { ...phase, tasks: phase.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task) } : phase
  )), [updatePhases]);
  const saveTask = useCallback((phaseId: string, task: Task) => updatePhases((phases) => phases.map((phase) =>
    phase.id === phaseId ? { ...phase, tasks: phase.tasks.some((item) => item.id === task.id) ? phase.tasks.map((item) => item.id === task.id ? task : item) : [...phase.tasks, task] } : phase
  )), [updatePhases]);
  const deleteTask = useCallback((phaseId: string, taskId: string) => updatePhases((phases) => phases.map((phase) =>
    phase.id === phaseId ? { ...phase, tasks: phase.tasks.filter((task) => task.id !== taskId) } : phase
  )), [updatePhases]);
  const updatePhase = useCallback((value: Phase) => updatePhases((phases) => phases.map((phase) => phase.id === value.id ? value : phase)), [updatePhases]);
  const saveProject = useCallback((value: Project) => setData((current) => ({ ...current, projects: current.projects.some((item) => item.id === value.id) ? current.projects.map((item) => item.id === value.id ? value : item) : [value, ...current.projects] })), []);
  const deleteProject = useCallback((id: string) => setData((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== id) })), []);
  const saveResource = useCallback((value: Resource) => setData((current) => ({ ...current, resources: current.resources.some((item) => item.id === value.id) ? current.resources.map((item) => item.id === value.id ? value : item) : [value, ...current.resources] })), []);
  const deleteResource = useCallback((id: string) => setData((current) => ({ ...current, resources: current.resources.filter((item) => item.id !== id) })), []);
  const addSession = useCallback((session: StudySession) => setData((current) => ({ ...current, sessions: [session, ...current.sessions] })), []);
  const updateSettings = useCallback((settings: Partial<AppData["settings"]>) => setData((current) => ({ ...current, settings: { ...current.settings, ...settings } })), []);
  const startTimer = useCallback(() => setTimer((current) => current.running ? current : { ...current, running: true, startedAt: Date.now() }), []);
  const pauseTimer = useCallback(() => setTimer((current) => !current.running || !current.startedAt ? current : ({ running: false, startedAt: null, accumulated: current.accumulated + Date.now() - current.startedAt })), []);
  const stopTimer = useCallback(() => {
    let elapsed = 0;
    setTimer((current) => {
      elapsed = current.accumulated + (current.running && current.startedAt ? Date.now() - current.startedAt : 0);
      return { running: false, startedAt: null, accumulated: 0 };
    });
    return elapsed;
  }, []);
  const resetData = useCallback(() => setData(createSeedData()), []);
  const importData = useCallback((value: unknown) => {
    const imported = migrateData(value);
    if (!imported) throw new Error("Il file non contiene un backup MakerPath valido.");
    setData(imported);
  }, []);
  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const value = useMemo(() => ({
    data, hydrated, timer, toggleTask, saveTask, deleteTask, updatePhase, saveProject, deleteProject,
    saveResource, deleteResource, addSession, updateSettings, startTimer, pauseTimer, stopTimer, resetData, importData, exportData,
  }), [data, hydrated, timer, toggleTask, saveTask, deleteTask, updatePhase, saveProject, deleteProject, saveResource, deleteResource, addSession, updateSettings, startTimer, pauseTimer, stopTimer, resetData, importData, exportData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp deve essere usato dentro AppProvider");
  return context;
};

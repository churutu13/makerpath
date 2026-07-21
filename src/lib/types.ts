export type Area = "Software" | "Hardware" | "Design" | "AI";
export type Status = "locked" | "available" | "active" | "completed";
export type Difficulty = "Base" | "Intermedia" | "Avanzata";
export type ProjectStatus = "Da iniziare" | "In corso" | "Completato";
export type ResourceType = "Corso" | "Video" | "Articolo" | "Documentazione" | "Libro" | "Repository";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  duration: number;
  difficulty: Difficulty;
  resourceId?: string;
}

export interface Phase {
  id: string;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  area: Area;
  hours: number;
  skills: string[];
  prerequisites: string[];
  finalProject: string;
  tasks: Task[];
  notes: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: Area;
  difficulty: Difficulty;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  dueDate?: string;
  phaseId: string;
  skills: string[];
  components: string[];
  estimatedCost: number;
  link?: string;
  notes: string;
  checklist: Task[];
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  area: Area;
  phaseId: string;
  url?: string;
  paid: boolean;
  status: "Da iniziare" | "In corso" | "Completata";
  rating: number;
  notes: string;
  progress: number;
  favorite: boolean;
}

export interface StudySession {
  id: string;
  date: string;
  duration: number;
  area: Area;
  phaseId?: string;
  taskId?: string;
  projectId?: string;
  note: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Settings {
  weeklyGoal: number;
  studyDays: number[];
  theme: "dark" | "light";
  reduceMotion: boolean;
}

export interface AppData {
  version: number;
  phases: Phase[];
  projects: Project[];
  resources: Resource[];
  sessions: StudySession[];
  achievements: Achievement[];
  settings: Settings;
}

export interface TimerState {
  running: boolean;
  startedAt: number | null;
  accumulated: number;
}

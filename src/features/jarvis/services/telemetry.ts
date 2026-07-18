import { completedTasks, currentPhase, getLevel, getStreak, getXP, overallProgress, weekMinutes } from "@/lib/stats";
import type { AppData } from "@/lib/types";
import type { JarvisTelemetry } from "../types/jarvis";

export function createJarvisTelemetry(data: AppData): JarvisTelemetry {
  const xp = getXP(data);
  const level = getLevel(xp);
  const mission = currentPhase(data).tasks.find((task) => !task.completed);
  const activeProject = data.projects.find((project) => project.status === "In corso");

  return {
    xp,
    levelNumber: level.number,
    levelName: level.name,
    roadmapProgress: overallProgress(data),
    streak: getStreak(data),
    weekHours: weekMinutes(data) / 60,
    activeProject: activeProject?.title ?? "Nessun progetto attivo",
    currentMission: mission?.title ?? "Roadmap completata",
    completedTasks: completedTasks(data),
  };
}

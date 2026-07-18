import type { AppData, Phase } from "./types";

export const phaseProgress = (phase: Phase) =>
  phase.tasks.length ? Math.round((phase.tasks.filter((item) => item.completed).length / phase.tasks.length) * 100) : 0;

export const completedTasks = (data: AppData) =>
  data.phases.reduce((sum, phase) => sum + phase.tasks.filter((task) => task.completed).length, 0);

export const totalTasks = (data: AppData) => data.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);

export const totalMinutes = (data: AppData) => data.sessions.reduce((sum, session) => sum + session.duration, 0);

export const getXP = (data: AppData) => {
  const tasks = completedTasks(data) * 25;
  const projects = data.projects.filter((project) => project.status === "Completato").length * 250;
  const phases = data.phases.filter((phase) => phaseProgress(phase) === 100).length * 500;
  return tasks + projects + phases;
};

export const levels = [
  { name: "Curious Builder", min: 0 },
  { name: "Digital Builder", min: 500 },
  { name: "Hardware Explorer", min: 1500 },
  { name: "Prototype Maker", min: 3000 },
  { name: "Product Builder", min: 5000 },
  { name: "Independent Maker", min: 8000 },
];

export const getLevel = (xp: number) => {
  const index = [...levels].reverse().findIndex((level) => xp >= level.min);
  const actualIndex = levels.length - 1 - index;
  const level = levels[actualIndex];
  const next = levels[actualIndex + 1];
  return { number: actualIndex + 1, ...level, next, progress: next ? Math.round(((xp - level.min) / (next.min - level.min)) * 100) : 100 };
};

export const currentPhase = (data: AppData) =>
  data.phases.find((phase) => phaseProgress(phase) < 100) ?? data.phases[data.phases.length - 1];

export const overallProgress = (data: AppData) =>
  totalTasks(data) ? Math.round((completedTasks(data) / totalTasks(data)) * 100) : 0;

export const getStreak = (data: AppData) => {
  const dates = [...new Set(data.sessions.map((session) => session.date))].sort().reverse();
  if (!dates.length) return 0;
  let streak = 0;
  const cursor = new Date(`${dates[0]}T12:00:00`);
  for (const date of dates) {
    const current = new Date(`${date}T12:00:00`);
    const diff = Math.round((cursor.getTime() - current.getTime()) / 86400000);
    if (diff > 1) break;
    streak += 1;
    cursor.setDate(current.getDate() - 1);
  }
  return streak;
};

export const weekMinutes = (data: AppData) => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return data.sessions.filter((session) => new Date(`${session.date}T12:00:00`) >= start)
    .reduce((sum, session) => sum + session.duration, 0);
};

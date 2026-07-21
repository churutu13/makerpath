import type { Achievement, AppData, Area, Difficulty, Phase, Project, Resource, Task } from "./types";

const task = (phase: number, index: number, title: string, duration = 60, difficulty: Difficulty = "Base"): Task => ({
  id: `p${phase}-t${index}`, title, completed: false, duration, difficulty,
});

const phaseData: Array<[string, string, Area, number, string[], string]> = [
  ["Fondamenta software", "Impara a pensare, costruire e pubblicare software affidabile.", "Software", 45, ["CS50", "Python", "TypeScript", "Git", "API", "Debugging", "OWASP", "Codex"], "Costruire e pubblicare una semplice web app completa."],
  ["Elettronica ed ESP32", "Porta il codice nel mondo fisico con circuiti, sensori e connettività.", "Hardware", 38, ["Legge di Ohm", "Breadboard", "GPIO", "PWM", "ESP32", "C++", "MicroPython", "Wi-Fi", "Bluetooth", "OLED"], "Dashboard da scrivania con ESP32 e display."],
  ["Raspberry Pi e Linux", "Costruisci sistemi connessi, servizi e integrazioni hardware.", "Hardware", 30, ["Linux", "Shell", "SSH", "Python", "GPIO", "Servizi", "Camera", "Audio"], "Dashboard intelligente con meteo, calendario e informazioni personali."],
  ["CAD e meccanica", "Progetta involucri precisi e pronti per la fabbricazione.", "Design", 28, ["Fusion 360", "Onshape", "Sketch", "Vincoli", "Tolleranze", "Parametrico", "Snap-fit"], "Disegnare una custodia personalizzata per un progetto ESP32."],
  ["Stampa 3D", "Trasforma modelli digitali in parti fisiche solide e funzionali.", "Hardware", 22, ["FDM", "Slicer", "PLA", "PETG", "Supporti", "Calibrazione", "Post-processing"], "Stampare e assemblare una custodia completa per un dispositivo."],
  ["Saldatura e prototipazione", "Rendi permanenti, ordinati e sicuri i tuoi circuiti.", "Hardware", 20, ["Saldatura", "Flussante", "Perfboard", "Multimetro", "Connettori", "Sicurezza"], "Trasformare un prototipo su breadboard in un dispositivo saldato."],
  ["Progettazione PCB", "Disegna, ordina e testa la tua prima scheda elettronica.", "Hardware", 32, ["KiCad", "Schema", "Footprint", "Routing", "Ground plane", "BOM", "Gerber"], "Progettare e ordinare il primo PCB personalizzato."],
  ["Product design e UI/UX", "Crea prodotti comprensibili, coerenti e piacevoli da usare.", "Design", 28, ["Figma", "Gerarchia", "Tipografia", "Design system", "User flow", "Accessibilità"], "Progettare interfaccia e identità visiva di un dispositivo."],
  ["AI e dispositivi intelligenti", "Integra percezione, voce e intelligenza nei tuoi prototipi.", "AI", 36, ["LLM", "Structured output", "Tool calling", "STT", "TTS", "Vision", "Privacy"], "Assistente AI fisico con microfono, speaker e interfaccia."],
  ["Dal prototipo al prodotto", "Valida, testa e porta un prodotto nelle mani di utenti reali.", "Design", 40, ["Validazione", "MVP", "BOM", "Fornitori", "User test", "Packaging", "Landing page"], "Creare un prodotto completo e testarlo con almeno cinque persone."],
];

export const phases: Phase[] = phaseData.map(([title, description, area, hours, skills, finalProject], idx) => {
  const order = idx + 1;
  const tasks = skills.map((name, i) => task(order, i + 1, name, i % 3 === 0 ? 90 : 60, i > 5 ? "Intermedia" : "Base"));
  tasks.push(task(order, skills.length + 1, `Progetto finale · ${finalProject}`, 300, "Avanzata"));
  return {
    id: `phase-${order}`, order, title, shortTitle: title.split(" e ")[0], description, area, hours, skills,
    prerequisites: order === 1 ? ["Nessuno"] : [`Completa la fase ${order - 1}`], finalProject, tasks, notes: "",
  };
});

const projectNames: Array<[string, Area, Difficulty, number]> = [
  ["LED controllato da pulsante", "Hardware", "Base", 2],
  ["Stazione meteo con ESP32", "Hardware", "Intermedia", 2],
  ["Dashboard OLED Wi-Fi", "Hardware", "Intermedia", 2],
  ["Pulsante fisico per avviare un’automazione", "Hardware", "Intermedia", 3],
  ["Dashboard e-ink da scrivania", "Hardware", "Avanzata", 3],
  ["Controller Spotify fisico", "Hardware", "Avanzata", 6],
  ["Assistente AI da scrivania", "AI", "Avanzata", 9],
  ["Tracker intelligente per tennis", "AI", "Avanzata", 9],
  ["Monitor di abitudini e benessere", "Design", "Intermedia", 8],
  ["Primo prodotto testato da utenti", "Design", "Avanzata", 10],
];

export const projects: Project[] = projectNames.map(([title, category, difficulty, phase], i) => ({
  id: `project-${i + 1}`, title,
  description: i === 0 ? "Il primo circuito interattivo: premi, osserva, misura." : "Un progetto pratico per consolidare competenze reali.",
  category, difficulty, status: i === 0 ? "In corso" : "Da iniziare", progress: i === 0 ? 25 : 0,
  startDate: i === 0 ? "2026-07-14" : "", phaseId: `phase-${phase}`,
  skills: phases[phase - 1].skills.slice(0, 3), components: category === "Hardware" ? ["Breadboard", "Cavi", "Componenti elettronici"] : [],
  estimatedCost: category === "Hardware" ? 35 : 0, notes: "",
  checklist: ["Definisci il risultato", "Raccogli materiali", "Costruisci il prototipo", "Testa e documenta"].map((name, x) => ({
    ...task(100 + i, x + 1, name, 45), completed: i === 0 && x === 0,
  })),
}));

export const resources: Resource[] = [
  ["CS50x", "Corso", "Software", "phase-1", "https://cs50.harvard.edu/x/"],
  ["Git Documentation", "Documentazione", "Software", "phase-1", "https://git-scm.com/doc"],
  ["OWASP Top 10", "Articolo", "Software", "phase-1", "https://owasp.org/www-project-top-ten/"],
  ["Random Nerd Tutorials", "Articolo", "Hardware", "phase-2", "https://randomnerdtutorials.com/"],
  ["Espressif Documentation", "Documentazione", "Hardware", "phase-2", "https://docs.espressif.com/"],
  ["Adafruit Learn", "Articolo", "Hardware", "phase-2", "https://learn.adafruit.com/"],
  ["Raspberry Pi Learning", "Corso", "Hardware", "phase-3", "https://www.raspberrypi.org/learn/"],
  ["Onshape Learning Center", "Corso", "Design", "phase-4", "https://learn.onshape.com/"],
  ["KiCad Documentation", "Documentazione", "Hardware", "phase-7", "https://docs.kicad.org/"],
  ["Figma Learn", "Corso", "Design", "phase-8", "https://help.figma.com/"],
  ["OpenAI Documentation", "Documentazione", "AI", "phase-9", "https://platform.openai.com/docs"],
].map(([title, type, area, phaseId, url], i) => ({
  id: `resource-${i + 1}`, title: String(title), type: type as Resource["type"], area: area as Area,
  phaseId: String(phaseId), url: String(url), paid: false, status: "Da iniziare", rating: 0, notes: "", progress: 0, favorite: i < 2,
}));

export const achievements: Achievement[] = [
  ["first-step", "First Step", "Completa il primo task", "footprints"],
  ["hello-hardware", "Hello Hardware", "Completa il primo progetto ESP32", "cpu"],
  ["seven-day", "Seven Day Spark", "Raggiungi 7 giorni di streak", "flame"],
  ["prototype", "Prototype Alive", "Completa un prototipo funzionante", "zap"],
  ["cad-rookie", "CAD Rookie", "Completa il primo modello 3D", "box"],
  ["first-print", "First Print", "Completa la prima stampa", "printer"],
  ["solder", "Solder Initiate", "Completa il primo circuito saldato", "circuit-board"],
  ["board", "Board Designer", "Completa il primo PCB", "microchip"],
  ["ai-maker", "AI Maker", "Completa un dispositivo con AI", "sparkles"],
  ["product", "Product Builder", "Testa un prodotto con utenti reali", "rocket"],
].map(([id, title, description, icon]) => ({ id, title, description, icon, unlocked: false }));

export const createSeedData = (): AppData => ({
  version: 3, phases: structuredClone(phases), projects: structuredClone(projects),
  resources: structuredClone(resources), achievements: structuredClone(achievements),
  sessions: [],
  settings: {
    weeklyGoal: 5,
    studyDays: [1, 3, 5],
    theme: "dark",
    reduceMotion: false,
  },
});

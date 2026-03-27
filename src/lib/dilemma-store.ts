export interface DilemmaLog {
  id: string;
  content: string;
  answer: string;
  createdAt: string;
}

const STORAGE_KEY = "mayolog_dilemmas";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getDilemmaLogs(): DilemmaLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DilemmaLog[];
  } catch {
    return [];
  }
}

export function addDilemmaLog(
  content: string,
  answer: string,
): DilemmaLog {
  const log: DilemmaLog = {
    id: generateId(),
    content,
    answer,
    createdAt: new Date().toISOString(),
  };
  const logs = getDilemmaLogs();
  logs.unshift(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return log;
}

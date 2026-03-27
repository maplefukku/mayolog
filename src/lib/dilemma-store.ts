export type Category = 'career' | 'relationship' | 'time' | 'self' | 'daily';

export interface DilemmaLog {
  id: string;
  content: string;
  answer: string;
  category?: Category;
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
  category?: Category,
): DilemmaLog {
  const log: DilemmaLog = {
    id: generateId(),
    content,
    answer,
    category,
    createdAt: new Date().toISOString(),
  };
  const logs = getDilemmaLogs();
  logs.unshift(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return log;
}

export function updateDilemmaCategory(id: string, category: Category): void {
  const logs = getDilemmaLogs();
  const log = logs.find((l) => l.id === id);
  if (log) {
    log.category = category;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }
}

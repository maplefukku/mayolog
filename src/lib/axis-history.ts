export interface AxisSnapshot {
  date: string; // ISO形式
  axes: { label: string; value: number }[];
}

const STORAGE_KEY = "mayolog_axis_history";

export function getAxisHistory(): AxisSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AxisSnapshot[];
  } catch {
    return [];
  }
}

export function addAxisSnapshot(axes: { label: string; value: number }[]): AxisSnapshot {
  const snapshot: AxisSnapshot = {
    date: new Date().toISOString(),
    axes,
  };
  const history = getAxisHistory();
  history.push(snapshot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return snapshot;
}

export function getLatestSnapshot(): AxisSnapshot | null {
  const history = getAxisHistory();
  return history.length > 0 ? history[history.length - 1] : null;
}

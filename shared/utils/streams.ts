import { StreamCategory } from "../types/stream";

export function formatDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (!hours) return `${minutes}m`;
  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}

export function categoryLabel(category: StreamCategory): string {
  switch (category) {
    case "study":
      return "Study";
    case "music":
      return "Music";
    case "gaming":
      return "Gaming";
    case "talk":
      return "Talk";
  }
}

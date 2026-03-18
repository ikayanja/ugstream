export type StreamCategory = "study" | "music" | "gaming" | "talk";

export interface Stream {
  id: string;
  title: string;
  host: string;
  category: StreamCategory;
  startsAtIso: string;
  durationMinutes: number;
}

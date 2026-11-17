// SAMPLE weekly timetable — the single source of truth for the hero preview, day tabs,
// filters and registration flow. Capacity numbers are ILLUSTRATIVE, not live availability.

import type { FormatId } from './formats';
import type { CoachId } from './coaches';
import { formatById } from './formats';

export type Level = 'visi' | 'pradedantiesiems' | 'pazengusiems';

export const levels: { id: Level; label: string }[] = [
  { id: 'visi', label: 'Visi lygiai' },
  { id: 'pradedantiesiems', label: 'Pradedantiesiems' },
  { id: 'pazengusiems', label: 'Pažengusiems' },
];

export interface Session {
  id: string;
  /** 0 = pirmadienis … 6 = sekmadienis */
  day: number;
  start: string; // "HH:MM"
  duration: number; // minutes
  format: FormatId;
  focus?: string;
  coach: CoachId;
  level: Level;
  capacity: number;
  booked: number; // demo value
}

type Row = [day: number, start: string, format: FormatId, coach: CoachId, level: Level, capacity: number, booked: number, focus?: string];

const rows: Row[] = [
  // Pirmadienis
  [0, '07:00', 'functional', 'ieva', 'visi', 14, 9],
  [0, '12:15', 'hiit', 'dovydas', 'pazengusiems', 12, 12],
  [0, '17:30', 'strength', 'lukas', 'pradedantiesiems', 10, 7, 'Technikos pagrindai'],
  [0, '18:45', 'hiit', 'dovydas', 'visi', 14, 11],
  [0, '20:00', 'mobility', 'ieva', 'visi', 14, 5],
  // Antradienis
  [1, '07:00', 'strength', 'lukas', 'visi', 10, 8],
  [1, '12:15', 'mobility', 'ieva', 'visi', 14, 4, 'Nugara ir klubai'],
  [1, '17:30', 'functional', 'dovydas', 'visi', 14, 14],
  [1, '18:45', 'strength', 'lukas', 'pazengusiems', 10, 6, 'Jėgos ciklas'],
  // Trečiadienis
  [2, '07:00', 'hiit', 'dovydas', 'visi', 14, 10],
  [2, '12:15', 'functional', 'ieva', 'pradedantiesiems', 12, 5, 'Pirmi žingsniai'],
  [2, '17:30', 'functional', 'ieva', 'visi', 14, 12],
  [2, '18:45', 'strength', 'lukas', 'visi', 10, 9],
  [2, '20:00', 'mobility', 'ieva', 'visi', 14, 6],
  // Ketvirtadienis
  [3, '07:00', 'functional', 'dovydas', 'visi', 14, 7],
  [3, '12:15', 'strength', 'lukas', 'pradedantiesiems', 10, 4, 'Technikos pagrindai'],
  [3, '17:30', 'hiit', 'dovydas', 'pazengusiems', 12, 11],
  [3, '18:45', 'mobility', 'ieva', 'visi', 14, 8],
  // Penktadienis
  [4, '07:00', 'mobility', 'ieva', 'visi', 14, 3, 'Rytinis judesys'],
  [4, '12:15', 'hiit', 'dovydas', 'visi', 14, 9],
  [4, '17:30', 'strength', 'lukas', 'visi', 10, 10],
  [4, '18:45', 'functional', 'ieva', 'visi', 14, 6],
  // Šeštadienis
  [5, '09:00', 'functional', 'ieva', 'pradedantiesiems', 12, 7, 'Pirmi žingsniai'],
  [5, '10:15', 'hiit', 'dovydas', 'visi', 14, 13],
  [5, '11:30', 'strength', 'lukas', 'pazengusiems', 10, 5, 'Jėgos ciklas'],
  // Sekmadienis
  [6, '10:00', 'mobility', 'ieva', 'visi', 14, 9],
  [6, '11:15', 'functional', 'lukas', 'visi', 14, 8],
];

export const sessions: Session[] = rows.map(([day, start, format, coach, level, capacity, booked, focus]) => ({
  id: `d${day}-${start.replace(':', '')}`,
  day,
  start,
  duration: formatById(format).duration,
  format,
  focus,
  coach,
  level,
  capacity,
  booked: Math.min(booked, capacity),
}));

export const spotsLeft = (s: Session): number => Math.max(0, s.capacity - s.booked);

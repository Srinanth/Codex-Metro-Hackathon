import type { Business } from "../models/business.model.js";
import type { FlexibleData } from "../types/business.js";

export function text(payload: FlexibleData, key: string): string | null {
  const value = payload[key]; return typeof value === "string" && value.trim() ? value.trim() : null;
}
export function number(payload: FlexibleData, key: string): number | null {
  const value = payload[key]; return typeof value === "number" && Number.isFinite(value) ? value : null;
}
export function businessId(business: Business): string { return String((business as { _id?: unknown })._id ?? ""); }
export function configNumber(business: Business, key: string, fallback: number): number { const value = business.configuration[key]; return typeof value === "number" && Number.isFinite(value) ? value : fallback; }
export function configHours(business: Business, date: string): { start: string; end: string } | null {
  const source = business.configuration.workingHours ?? business.configuration.hours;
  if (!source || typeof source !== "object" || Array.isArray(source)) return null;
  const day = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(`${date}T12:00:00`)).toLowerCase();
  const value = (source as Record<string, unknown>)[day] ?? (source as Record<string, unknown>)[day.slice(0, 3)];
  if (typeof value === "string") { const match = value.match(/(\d{1,2}:\d{2})\s*(?:-|to)\s*(\d{1,2}:\d{2})/i); const start = match?.[1]; const end = match?.[2]; return start && end ? { start, end } : null; }
  if (value && typeof value === "object" && !Array.isArray(value)) { const start = (value as Record<string, unknown>).start; const end = (value as Record<string, unknown>).end; return typeof start === "string" && typeof end === "string" ? { start, end } : null; }
  return null;
}
export function minutes(time: string): number | null { const match = time.match(/^(\d{1,2}):(\d{2})$/); if (!match) return null; const hour = Number(match[1]); const minute = Number(match[2]); return hour >= 0 && hour < 24 && minute >= 0 && minute < 60 ? hour * 60 + minute : null; }
export function timeFromMinutes(value: number): string { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
export function overlaps(startA: number, endA: number, startB: number, endB: number): boolean { return startA < endB && endA > startB; }

const nonNameWords = new Set(["i", "need", "want", "book", "hair", "haircut", "cut", "appointment", "tomorrow", "today", "please", "can", "you", "me", "it", "services", "service"]);

export function isValidCustomerName(value: string): boolean {
  const parts = value.trim().split(/\s+/);
  return parts.length >= 2
    && parts.length <= 4
    && parts.every((part) => /^[a-z][a-z'-]{1,}$/i.test(part) && !nonNameWords.has(part.toLowerCase()));
}

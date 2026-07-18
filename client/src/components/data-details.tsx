import type { ReactNode } from "react";

type FlexibleValue = unknown;

export function hasDisplayValue(value: FlexibleValue): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).some((key) => hasDisplayValue((value as Record<string, unknown>)[key]));
  return true;
}

export function DataDetails({ value, className = "" }: { value: Record<string, unknown>; className?: string }) {
  const entries = Object.entries(value).filter(([, entryValue]) => hasDisplayValue(entryValue));
  if (entries.length === 0) return null;

  return <dl className={`space-y-3 text-sm ${className}`}>{entries.map(([key, entryValue]) => <div key={key} className="border-b border-border/60 pb-3 last:border-0 last:pb-0"><dt className="text-xs font-medium uppercase tracking-wider text-muted">{labelFor(key)}</dt><dd className="mt-1.5 text-foreground">{renderValue(entryValue)}</dd></div>)}</dl>;
}

export function summaryFor(value: FlexibleValue, fallback = "Not specified"): string {
  if (!hasDisplayValue(value)) return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((entry) => summaryFor(entry, "")).filter(Boolean).join(", ");
  return Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => hasDisplayValue(entryValue)).map(([key, entryValue]) => `${labelFor(key)}: ${summaryFor(entryValue, "")}`).join(" · ");
}

function renderValue(value: FlexibleValue): ReactNode {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return <div className="flex flex-wrap gap-2">{value.filter(hasDisplayValue).map((entry, index) => <span key={`${summaryFor(entry)}-${index}`} className="rounded-full border border-border bg-[#0F172A] px-2.5 py-1 text-xs text-muted">{summaryFor(entry)}</span>)}</div>;
  if (value && typeof value === "object") return <DataDetails value={value as Record<string, unknown>} className="mt-2 rounded-lg border border-border bg-[#0F172A] p-3" />;
  return null;
}

function labelFor(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").replace(/^./, (character) => character.toUpperCase());
}

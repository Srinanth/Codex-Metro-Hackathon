import type { Business, BusinessExtraction, BusinessProfile, Operation, ReceptionistReply } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4001/api";
type ApiResponse<T> = { success: boolean; message: string; data: T };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json", ...options?.headers }, ...options });
  } catch {
    throw new Error("Unable to reach BizzAI. Check your connection and try again.");
  }
  const payload = await response.json().catch(() => null) as ApiResponse<T> | null;
  if (!response.ok || !payload?.success) throw new Error(payload?.message ?? "The request could not be completed.");
  return payload.data;
}

export function healthCheck() { return request<{ service: string }>("/health"); }
export function extractBusiness(description: string) { return request<BusinessExtraction>("/ai/extract-business", { method: "POST", body: JSON.stringify({ description }) }); }
export async function createBusiness(profile: BusinessProfile) { return normalizeBusiness(await request<Business>("/business", { method: "POST", body: JSON.stringify(profile) })); }
export async function getBusiness(id: string) { return normalizeBusiness(await request<Business>(`/business/${id}`)); }
export async function getBusinesses() { return (await request<Business[]>("/business")).map(normalizeBusiness); }
export function getOperations() { return request<Operation[]>("/records"); }
export function createOperation(operation: Pick<Operation, "businessId" | "entityType" | "status" | "data" | "metadata">) { return request<Operation>("/records", { method: "POST", body: JSON.stringify(operation) }); }
export function sendReceptionistMessage(businessId: string, message: string, history: Array<{ role: "user" | "assistant"; content: string }>) {
  const meaningfulHistory = history.filter(({ content }) => content.trim().length > 0);
  return request<ReceptionistReply>("/ai/interactions", { method: "POST", body: JSON.stringify({ businessId, message, history: meaningfulHistory }) });
}

function normalizeBusiness(business: Business): Business {
  return {
    ...business,
    configuration: isRecord(business.configuration) ? business.configuration : {},
    capabilities: Array.isArray(business.capabilities) ? business.capabilities : [],
    rules: Array.isArray(business.rules) ? business.rules : [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

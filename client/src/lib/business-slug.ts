import type { Business } from "@/types";

export function businessSlug(business: Business) {
  const id = business.id ?? business._id ?? "";
  return `${business.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${id}`;
}

export function matchesBusinessSlug(business: Business, slug: string) { return businessSlug(business) === slug; }

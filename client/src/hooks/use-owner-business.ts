import { useEffect, useState } from "react";
import { getBusiness } from "@/services/api";
import type { Business } from "@/types";

export function useOwnerBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const businessId = localStorage.getItem("ownerBusinessId");

  useEffect(() => { void load(); }, [businessId]);
  async function load() {
    if (!businessId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try { setBusiness(await getBusiness(businessId)); }
    catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Unable to load your business."); }
    finally { setLoading(false); }
  }
  return { business, businessId, loading, error, reload: load };
}

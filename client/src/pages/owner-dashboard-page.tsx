import { CheckCircle2, CircleDashed, Clock3, ListTodo } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, LoadingCards, MetricCard, PageHeader, Panel, Tags } from "@/components/dashboard-ui";
import { Button } from "@/components/ui/button";
import { useOwnerBusiness } from "@/hooks/use-owner-business";
import { getOperations } from "@/services/api";
import type { Operation } from "@/types";

export function OwnerDashboardPage() {
  const { business, businessId, loading, error } = useOwnerBusiness();
  const [operations, setOperations] = useState<Operation[]>([]);
  useEffect(() => { if (!businessId) return; void getOperations().then((items) => setOperations(items.filter((item) => item.businessId === businessId))).catch(() => setOperations([])); }, [businessId]);
  if (loading) return <LoadingCards />;
  if (!businessId || !business) return <EmptyState icon={CircleDashed} title="Finish setting up your business" description={error ?? "Create your business profile before using the dashboard."} action={<Button asChild><Link to="/owner/onboarding">Open onboarding</Link></Button>} />;
  const today = new Date().toDateString(); const completed = operations.filter((item) => item.status.toLowerCase() === "completed").length; const cancelled = operations.filter((item) => item.status.toLowerCase() === "cancelled").length;
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><PageHeader eyebrow={business.businessType} title={business.name} description="A clear view of what is happening across your business." action={<Button asChild><Link to="/owner/operations">View operations</Link></Button>} /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Total operations" value={operations.length} icon={ListTodo} /><MetricCard label="Today's operations" value={operations.filter((item) => new Date(item.createdAt).toDateString() === today).length} icon={Clock3} /><MetricCard label="Completed" value={completed} icon={CheckCircle2} /><MetricCard label="Cancelled" value={cancelled} icon={CircleDashed} /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><Panel title="Business information"><dl className="grid gap-5 sm:grid-cols-2"><Detail label="Business type" value={business.businessType} /><Detail label="Address" value={business.address ?? "Not provided"} /><Detail label="Phone" value={business.phone ?? "Not provided"} /><Detail label="Description" value={business.description ?? "Not provided"} /><div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wider text-muted">Capabilities</dt><dd className="mt-2"><Tags values={business.capabilities} /></dd></div><div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wider text-muted">Rules</dt><dd className="mt-2 text-sm text-muted">{business.rules.length ? business.rules.join(" · ") : "No rules configured"}</dd></div></dl><div className="mt-6"><Button variant="outline" disabled>Edit business information</Button></div></Panel><Panel title="Working configuration"><pre className="max-h-80 overflow-auto rounded-lg border border-border bg-[#0F172A] p-4 text-xs leading-6 text-muted">{JSON.stringify(business.configuration, null, 2)}</pre></Panel></div></motion.div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt><dd className="mt-2 text-sm">{value}</dd></div>; }

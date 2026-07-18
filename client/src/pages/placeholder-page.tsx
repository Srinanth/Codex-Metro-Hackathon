import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
export function PlaceholderPage({ title, description, icon = Construction }: { title: string; description: string; icon?: LucideIcon }) { return <><h1 className="text-3xl font-semibold">{title}</h1><div className="mt-8"><EmptyState icon={icon} title="Coming soon" description={description} /></div></>; }

import { createContext, useContext, useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type ToastKind = "success" | "error" | "loading";
type Toast = { id: string; kind: ToastKind; message: string };
type ToastContextValue = { show: (kind: ToastKind, message: string) => string; dismiss: (id: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);
export function ToastProvider({ children }: { children: React.ReactNode }) { const [toasts, setToasts] = useState<Toast[]>([]); const dismiss = (id: string) => setToasts((items) => items.filter((item) => item.id !== id)); const show = (kind: ToastKind, message: string) => { const id = crypto.randomUUID(); setToasts((items) => [...items, { id, kind, message }]); if (kind !== "loading") window.setTimeout(() => dismiss(id), 4200); return id; }; return <ToastContext.Provider value={{ show, dismiss }}>{children}<div aria-live="polite" className="fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-3"><AnimatePresence>{toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />)}</AnimatePresence></div></ToastContext.Provider>; }
export function useToast() { const context = useContext(ToastContext); if (!context) throw new Error("useToast must be used inside ToastProvider"); return context; }
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) { const Icon = toast.kind === "success" ? CheckCircle2 : toast.kind === "error" ? CircleAlert : LoaderCircle; const color = toast.kind === "success" ? "text-[#86efac]" : toast.kind === "error" ? "text-[#fca5a5]" : "text-accent"; return <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-xl"><Icon className={`h-5 w-5 shrink-0 ${color} ${toast.kind === "loading" ? "animate-spin" : ""}`} /><p className="flex-1 text-sm">{toast.message}</p><Button variant="ghost" size="icon" onClick={onDismiss} aria-label="Dismiss notification"><X className="h-4 w-4" /></Button></motion.div>; }

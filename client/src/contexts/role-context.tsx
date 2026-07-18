import { createContext, useContext, useEffect, useState } from "react";
import type { UserRole } from "@/types";
type RoleContextValue = { role: UserRole | null; setRole: (role: UserRole) => void; clearRole: () => void };
const RoleContext = createContext<RoleContextValue | null>(null);
export function RoleProvider({ children }: { children: React.ReactNode }) { const [role, setRoleState] = useState<UserRole | null>(null); useEffect(() => { const saved = localStorage.getItem("role"); if (saved === "owner" || saved === "customer") setRoleState(saved); }, []); const setRole = (next: UserRole) => { localStorage.setItem("role", next); setRoleState(next); }; const clearRole = () => { localStorage.removeItem("role"); setRoleState(null); }; return <RoleContext.Provider value={{ role, setRole, clearRole }}>{children}</RoleContext.Provider>; }
export function useRole() { const context = useContext(RoleContext); if (!context) throw new Error("useRole must be used within RoleProvider"); return context; }

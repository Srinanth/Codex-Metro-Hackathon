import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "@/app";
import { RoleProvider } from "@/contexts/role-context";
import { ToastProvider } from "@/contexts/toast-context";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import "@/index.css";
createRoot(document.getElementById("root")!).render(<StrictMode><AppErrorBoundary><BrowserRouter><RoleProvider><ToastProvider><App /></ToastProvider></RoleProvider></BrowserRouter></AppErrorBoundary></StrictMode>);

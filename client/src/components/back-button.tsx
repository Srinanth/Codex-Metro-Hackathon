import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function BackButton({ fallback = "/", label = "Back" }: { fallback?: string; label?: string }) {
  const navigate = useNavigate();
  const goBack = () => window.history.length > 1 ? navigate(-1) : navigate(fallback);
  return <Button variant="ghost" onClick={goBack} className="gap-2 text-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" />{label}</Button>;
}

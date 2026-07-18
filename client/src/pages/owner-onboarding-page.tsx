import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, CircleAlert, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { createBusiness, extractBusiness } from "@/services/api";
import type { BusinessProfile } from "@/types";
import { useToast } from "@/contexts/toast-context";

const example = `My business is Tony's Classic Cuts, a barber shop in Indiranagar.
We work Monday to Saturday, 10 AM to 8 PM.
Haircuts take around 30 minutes and beard trims take 20 minutes.
We don't accept walk-ins after 7 PM.`;
type Step = "describe" | "extracting" | "review" | "saving" | "success";

export function OwnerOnboardingPage() {
  const navigate = useNavigate();
  const { show, dismiss } = useToast();
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<Step>("describe");
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyse = async () => {
    if (description.trim().length < 20) { setError("Please provide a little more detail about your business."); return; }
    setError(null); setStep("extracting");
    try {
      const result = await extractBusiness(description);
      if (result.status !== "complete" || !result.business) { setError(result.message); setStep("describe"); return; }
      setProfile(result.business); setStep("review");
    } catch (reason: unknown) { setError(messageFrom(reason)); setStep("describe"); }
  };

  const confirm = async () => {
    if (!profile) return;
    setError(null); setStep("saving");
    const toastId = show("loading", "Saving your business profile…");
    try { const business = await createBusiness(profile); const businessId = business.id ?? business._id; if (!businessId) throw new Error("Business was saved but no identifier was returned."); localStorage.setItem("ownerBusinessId", businessId); dismiss(toastId); show("success", "Business profile saved."); setStep("success"); window.setTimeout(() => navigate("/owner/dashboard"), 1100); }
    catch (reason: unknown) { dismiss(toastId); const message = messageFrom(reason); setError(message); show("error", message); setStep("review"); }
  };

  return <main className="min-h-screen px-5 py-12 md:py-20"><div className="mx-auto max-w-3xl"><div className="mb-10 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary"><Sparkles className="h-5 w-5" /></div><h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">Set up your business</h1><p className="mt-3 text-muted">Describe your business naturally and let AI configure it.</p></div><StepIndicator step={step} /><AnimatePresence mode="wait"><motion.section key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .2 }} className="mt-7 rounded-xl border border-border bg-surface p-5 shadow-sm md:p-8">{step === "describe" && <DescribeStep description={description} error={error} onChange={setDescription} onSubmit={analyse} />}{step === "extracting" && <LoadingStep title="Understanding your business" text="BizzAI is creating a profile for you to review." />}{step === "review" && profile && <ReviewStep profile={profile} error={error} onEdit={() => { setError(null); setStep("describe"); }} onConfirm={confirm} />}{step === "saving" && <LoadingStep title="Saving your business" text="Your reviewed business profile is being saved securely." />}{step === "success" && <SuccessStep businessName={profile?.name ?? "your business"} />}</motion.section></AnimatePresence></div></main>;
}

function DescribeStep({ description, error, onChange, onSubmit }: { description: string; error: string | null; onChange: (value: string) => void; onSubmit: () => void }) { return <><h2 className="text-xl font-semibold">Tell us about your business</h2><p className="mt-2 text-sm leading-6 text-muted">Include your business name, type, services or products, hours, and any important rules.</p><textarea value={description} onChange={(event) => onChange(event.target.value)} placeholder={example} className="mt-6 min-h-64 w-full resize-y rounded-lg border border-border bg-[#0F172A] px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30" aria-label="Business description" />{error && <Notice message={error} />}<div className="mt-6 flex justify-end"><Button size="lg" onClick={onSubmit}>Analyse business<Sparkles className="ml-2 h-4 w-4" /></Button></div></>; }

function LoadingStep({ title, text }: { title: string; text: string }) { return <div className="py-12 text-center"><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-accent" /><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted">{text}</p><div className="mx-auto mt-8 max-w-md space-y-3"><div className="h-3 animate-pulse rounded bg-slate-700" /><div className="h-3 w-4/5 animate-pulse rounded bg-slate-700" /><div className="h-3 w-3/5 animate-pulse rounded bg-slate-700" /></div></div>; }

function ReviewStep({ profile, error, onEdit, onConfirm }: { profile: BusinessProfile; error: string | null; onEdit: () => void; onConfirm: () => void }) { return <><p className="text-sm text-accent">Review before saving</p><h2 className="mt-1 text-xl font-semibold">Does this look right?</h2><p className="mt-2 text-sm text-muted">BizzAI only saves this profile after you confirm it.</p><dl className="mt-7 space-y-5"><Detail label="Business name"><span>{profile.name}</span></Detail><Detail label="Business type"><span className="capitalize">{profile.businessType}</span></Detail><Detail label="Capabilities"><div className="flex flex-wrap gap-2">{profile.capabilities.map((capability) => <span key={capability} className="rounded-full border border-border bg-[#0F172A] px-2.5 py-1 text-xs text-accent">{capability}</span>)}</div></Detail><Detail label="Configuration"><pre className="overflow-x-auto rounded-lg border border-border bg-[#0F172A] p-3 text-xs leading-5 text-muted">{JSON.stringify(profile.configuration, null, 2)}</pre></Detail><Detail label="Rules">{profile.rules.length ? <ul className="space-y-2 text-sm text-muted">{profile.rules.map((rule) => <li key={rule}>• {rule}</li>)}</ul> : <span className="text-sm text-muted">No rules provided</span>}</Detail></dl>{error && <Notice message={error} />}<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="outline" size="lg" onClick={onEdit}><ChevronLeft className="mr-1 h-4 w-4" />Edit</Button><Button size="lg" onClick={onConfirm}>Confirm and save<Check className="ml-2 h-4 w-4" /></Button></div></>; }

function SuccessStep({ businessName }: { businessName: string }) { return <div className="py-12 text-center"><motion.div initial={{ scale: .6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#166534]"><Check className="h-7 w-7" /></motion.div><h2 className="mt-6 text-2xl font-semibold">You’re all set</h2><p className="mt-3 text-muted"><span className="text-foreground">{businessName}</span> has been saved successfully.</p></div>; }

function Detail({ label, children }: { label: string; children: React.ReactNode }) { return <div><dt className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">{label}</dt><dd>{children}</dd></div>; }
function Notice({ message }: { message: string }) { return <div role="alert" className="mt-4 flex gap-2 rounded-lg border border-[#7f1d1d] bg-[#450a0a]/40 p-3 text-sm text-[#fca5a5]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>; }
function StepIndicator({ step }: { step: Step }) { const active = step === "describe" || step === "extracting" ? 1 : step === "review" || step === "saving" ? 2 : 3; return <div className="mx-auto flex max-w-sm items-center justify-between text-xs"><Step number={1} label="Describe" active={active >= 1} /><span className="mx-3 h-px flex-1 bg-border" /><Step number={2} label="Review" active={active >= 2} /><span className="mx-3 h-px flex-1 bg-border" /><Step number={3} label="Saved" active={active >= 3} /></div>; }
function Step({ number, label, active }: { number: number; label: string; active: boolean }) { return <div className={active ? "flex items-center gap-2 text-foreground" : "flex items-center gap-2 text-muted"}><span className={active ? "grid h-6 w-6 place-items-center rounded-full bg-primary text-white" : "grid h-6 w-6 place-items-center rounded-full border border-border"}>{number}</span>{label}</div>; }
function messageFrom(reason: unknown) { return reason instanceof Error ? reason.message : "Something went wrong. Please try again."; }

import { ArrowRight, Building2, LogIn, MessageSquareText, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/role-context";
import { getBusinesses } from "@/services/api";
import type { Business } from "@/types";

const benefits = [
  { icon: MessageSquareText, title: "Talk naturally", text: "Ask questions and make requests without navigating forms." },
  { icon: Search, title: "Discover nearby businesses", text: "Find a local business and start a conversation in seconds." },
  { icon: Building2, title: "Built for every operation", text: "One receptionist experience across services, orders and reservations." },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [ownerName, setOwnerName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    void getBusinesses().then(setBusinesses).catch(() => setLoginError("Unable to load demo businesses."));
  }, []);

  const loginAsOwner = () => {
    const business = businesses.find((item) => item.name.toLowerCase() === ownerName.trim().toLowerCase());
    const businessId = business?.id ?? business?._id;
    if (!business || !businessId) {
      setLoginError("Choose a business from the demo owner list.");
      return;
    }

    localStorage.setItem("ownerBusinessId", businessId);
    localStorage.setItem("ownerBusinessName", business.name);
    setRole("owner");
    navigate("/owner/dashboard");
  };

  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8"><Brand /><Button variant="ghost" onClick={() => navigate("/owner/onboarding")}>For business owners</Button></header>
    <main className="mx-auto max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pt-24">
      <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_.75fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="max-w-3xl">
          <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-sm text-accent">Meet BizzAI</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">A better way to talk to local businesses.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">BizzAI connects you with a business receptionist that understands what you need and handles the rest naturally.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row"><Button size="lg" onClick={() => navigate("/business")}><Search className="mr-2 h-5 w-5" />Search businesses<ArrowRight className="ml-2 h-4 w-4" /></Button><Button size="lg" variant="outline" onClick={() => navigate("/owner/onboarding")}><Building2 className="mr-2 h-5 w-5" />Set up your business</Button></div>
        </motion.div>
        <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-medium text-accent">Easy login</p>
          <h2 className="mt-2 text-xl font-semibold">Business owner login</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Choose a seeded business to open its owner workspace. No password is required.</p>
          <label className="mt-6 block text-sm font-medium" htmlFor="owner-business">Business name</label>
          <input id="owner-business" list="demo-owner-businesses" value={ownerName} onChange={(event) => { setOwnerName(event.target.value); setLoginError(null); }} onKeyDown={(event) => { if (event.key === "Enter") loginAsOwner(); }} className="mt-2 h-11 w-full rounded-lg border border-border bg-[#0F172A] px-3 text-sm outline-none focus:border-primary" placeholder="Select or enter a business name" aria-describedby={loginError ? "owner-login-error" : undefined} />
          <datalist id="demo-owner-businesses">{businesses.map((business) => <option key={business.id ?? business._id} value={business.name}>{business.businessType}</option>)}</datalist>
          {loginError && <p id="owner-login-error" className="mt-2 text-sm text-danger" role="alert">{loginError}</p>}
          <Button className="mt-5 w-full" onClick={loginAsOwner} disabled={businesses.length === 0}><LogIn className="mr-2 h-4 w-4" />Open owner dashboard</Button>
          <p className="mt-3 text-xs text-muted">Tip: click the field to see the seeded demo businesses.</p>
        </motion.aside>
      </div>
      <section className="mt-20 grid gap-4 md:grid-cols-3">{benefits.map(({ icon: Icon, title, text }, index) => <motion.article key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 + index * .08 }} className="rounded-xl border border-border bg-surface p-6 shadow-sm"><Icon className="h-6 w-6 text-accent" /><h2 className="mt-5 font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text}</p></motion.article>)}</section>
    </main>
    <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-muted sm:flex-row sm:items-center sm:justify-between md:px-8"><span>© 2026 BizzAI</span><span>AI reception for local businesses</span></div></footer>
  </div>;
}

import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/app-layout";
import { CustomerHomePage } from "@/pages/customer-home-page";
import { LandingPage } from "@/pages/landing-page";
import { OwnerDashboardPage } from "@/pages/owner-dashboard-page";
import { OwnerOperationsPage } from "@/pages/owner-operations-page";
import { OwnerProfilePage } from "@/pages/owner-profile-page";
import { OwnerAiConfigurationPage } from "@/pages/owner-ai-configuration-page";
import { OwnerSettingsPage } from "@/pages/owner-settings-page";
import { BusinessProfilePage } from "@/pages/business-profile-page";
import { BusinessSearchPage } from "@/pages/business-search-page";
import { OwnerOnboardingPage } from "@/pages/owner-onboarding-page";
import { ErrorPage } from "@/pages/error-page";
export function App() { return <Routes><Route path="/" element={<LandingPage />} /><Route path="/business" element={<BusinessSearchPage />} /><Route path="/business/:slug" element={<BusinessProfilePage />} /><Route path="owner" element={<Navigate to="/owner/dashboard" replace />} /><Route path="owner/onboarding" element={<OwnerOnboardingPage />} /><Route element={<AppLayout />}><Route path="owner/dashboard" element={<OwnerDashboardPage />} /><Route path="owner/operations" element={<OwnerOperationsPage />} /><Route path="owner/profile" element={<OwnerProfilePage />} /><Route path="owner/ai-configuration" element={<OwnerAiConfigurationPage />} /><Route path="owner/settings" element={<OwnerSettingsPage />} /><Route path="customer" element={<CustomerHomePage />} /></Route><Route path="/network-error" element={<ErrorPage kind="network" />} /><Route path="*" element={<ErrorPage />} /></Routes>; }

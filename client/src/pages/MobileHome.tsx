import { useAuth } from "@/hooks/useAuth";
import GitHubMobileLayout from "@/components/GitHubMobileLayout";
import ImprovedAndroidStudioLayout from "@/components/ImprovedAndroidStudioLayout";
import Landing from "@/pages/Landing";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import PerfectLoader from "@/components/PerfectLoader";

export default function MobileHome() {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showWelcome, setShowWelcome] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => setShowWelcome(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <PerfectLoader />;
  }

  if (!isAuthenticated || showWelcome) {
    return <Landing />;
  }

  // Always show GitHub mobile layout for mobile devices
  if (isMobile) {
    return <GitHubMobileLayout />;
  }

  // Desktop users get the IDE
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  return <ImprovedAndroidStudioLayout onLogin={handleLogin} />;
}
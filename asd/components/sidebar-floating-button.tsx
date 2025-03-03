"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export function SidebarFloatingButton() {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Only show after component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isMobile) {
    return null;
  }

  return (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-primary hover:bg-primary/90 p-4 h-14 w-14 flex items-center justify-center"
      onClick={toggleSidebar}
      aria-label="Open Sidebar"
    >
      <Menu className="h-6 w-6 text-white" />
    </Button>
  );
}
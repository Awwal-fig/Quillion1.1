import { Outlet } from "react-router";
import { useState } from "react";
import { TopHeader } from "./TopHeader";
import { NavBar } from "./NavBar";
import { Toaster } from "sonner";

export function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
        <TopHeader mobileNavOpen={mobileNavOpen} onToggleMobileNav={() => setMobileNavOpen((v) => !v)} />
        <NavBar mobileNavOpen={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
        <Outlet />
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}

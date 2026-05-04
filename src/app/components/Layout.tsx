import { Outlet } from "react-router";
import { TopHeader } from "./TopHeader";
import { NavBar } from "./NavBar";
import { MobileBlock } from "./MobileBlock";
import { Toaster } from "sonner";

export function Layout() {
  return (
    <>
      <div className="block md:hidden min-h-screen bg-[#F8FAFC]">
        <MobileBlock />
      </div>
      <div className="hidden md:block min-h-screen bg-[#F8FAFC]">
        <TopHeader />
        <NavBar />
        <Outlet />
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}
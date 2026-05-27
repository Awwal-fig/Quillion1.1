import { TopCards } from "./TopCards";
import { BottomCards } from "./BottomCards";
import { useAuth } from "./auth";

export function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
      <p className="text-[#22B8C7] mb-1 text-xs sm:text-sm font-medium tracking-wide">
        My Workspace
      </p>
      <h1 className="text-[#0F172A] mb-4 sm:mb-6 text-[1.375rem] sm:text-[1.625rem] font-bold leading-tight break-words">
        {greeting}, {firstName}
      </h1>
      <div className="flex flex-col gap-4 sm:gap-5">
        <TopCards />
        <BottomCards />
      </div>
    </main>
  );
}

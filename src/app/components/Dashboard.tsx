import { TopCards } from "./TopCards";
import { BottomCards } from "./BottomCards";
import { useAuth } from "./auth";

export function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <main className="max-w-[1440px] mx-auto px-10 py-6">
      <p className="text-[#22B8C7] mb-0.5" style={{ fontSize: "13px", fontWeight: 500 }}>
        My Workspace
      </p>
      <h1 className="text-[#0F172A] mb-6" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.3 }}>
        {greeting}, {firstName}
      </h1>
      <div className="flex flex-col gap-5">
        <TopCards />
        <BottomCards />
      </div>
    </main>
  );
}

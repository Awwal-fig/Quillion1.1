import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Bell, ChevronDown, User, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router";
import { getRecentActivities, type RecentActivity } from "./draftStore";
import { useAuth } from "./auth";
import { Logo } from "./Logo";

const SEEN_KEY = "lexdraft_notifications_seen";

function timeAgo(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function TopHeader({ mobileNavOpen, onToggleMobileNav }: { mobileNavOpen: boolean; onToggleMobileNav: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [lastSeen, setLastSeen] = useState<number>(() => parseInt(localStorage.getItem(SEEN_KEY) || "0", 10));
  const wrapRef = useRef<HTMLDivElement>(null);

  const sync = useCallback(() => setActivities(getRecentActivities()), []);
  useEffect(() => {
    sync();
    window.addEventListener("lexdraft-counters", sync);
    return () => window.removeEventListener("lexdraft-counters", sync);
  }, [sync]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = activities.filter((a) => new Date(a.timestamp).getTime() > lastSeen).length;

  const handleToggle = () => {
    if (!open) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setLastSeen(now);
    }
    setOpen((v) => !v);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initial = (user?.fullName || "?").charAt(0).toUpperCase();

  return (
    <header className="w-full bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-3 md:py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onToggleMobileNav} className="md:hidden p-2 rounded-lg border border-[#E5E7EB] bg-white" aria-label="Toggle navigation">
            <Menu size={18} className={mobileNavOpen ? "text-[#22B8C7]" : "text-[#0F172A]"} />
          </button>
          <Logo size={32} />
        </div>
        <div className="flex items-center gap-2 md:gap-5" ref={wrapRef}>
          <div className="hidden sm:flex items-center border border-[#D1D5DB] rounded-lg px-3.5 py-2 w-[180px] md:w-[220px]">
            <Search size={16} className="text-[#9CA3AF] mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none w-full text-[#6B7280] placeholder-[#9CA3AF]"
              style={{ fontSize: "14px" }}
            />
          </div>

          {/* Notification bell */}
          <div className="relative">
            <button onClick={handleToggle} className="p-2 relative hover:bg-[#F1F5F9] rounded-lg transition">
              <Bell size={20} className="text-[#0F172A]" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-[#EF4444] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                  style={{ fontSize: "10px", fontWeight: 700 }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 w-[min(340px,92vw)] bg-white rounded-xl border border-[#E8E8E8] shadow-lg z-50">
                <div className="px-4 py-3 border-b border-[#E8E8E8] flex items-center justify-between">
                  <p className="text-[#0F172A]" style={{ fontSize: "14px", fontWeight: 700 }}>Notifications</p>
                  <span className="text-[#6B7280]" style={{ fontSize: "11px" }}>
                    {activities.length} total
                  </span>
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {activities.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell size={28} className="text-[#CBD5E1] mx-auto mb-2" />
                      <p className="text-[#6B7280]" style={{ fontSize: "13px" }}>No notifications yet</p>
                      <p className="text-[#9CA3AF] mt-1" style={{ fontSize: "11px" }}>Activity from your drafts will appear here.</p>
                    </div>
                  ) : (
                    activities.slice(0, 10).map((a) => (
                      <div key={a.id} className="px-4 py-3 border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] transition flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#22B8C7] mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 500 }}>{a.action}</p>
                          <p className="text-[#6B7280] truncate" style={{ fontSize: "12px" }}>{a.templateName}</p>
                          <p className="text-[#9CA3AF] mt-0.5" style={{ fontSize: "11px" }}>{timeAgo(a.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen((v) => !v); setOpen(false); }}
              className="flex items-center gap-1 cursor-pointer bg-transparent border-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#22B8C7] text-white flex items-center justify-center" style={{ fontSize: "13px", fontWeight: 600 }}>
                {user ? initial : <User size={16} />}
              </div>
              <ChevronDown size={14} className="text-[#9CA3AF]" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-xl border border-[#E8E8E8] shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E8E8E8]">
                  <p className="text-[#0F172A] truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{user?.fullName}</p>
                  <p className="text-[#6B7280] truncate" style={{ fontSize: "12px" }}>{user?.email}</p>
                </div>
                <button
                  onClick={() => { setProfileOpen(false); navigate("/settings"); }}
                  className="w-full text-left px-4 py-2.5 text-[#0F172A] hover:bg-[#F8FAFC] transition bg-transparent border-none"
                  style={{ fontSize: "13px" }}
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-[#EF4444] hover:bg-[#FEF2F2] transition flex items-center gap-2 bg-transparent border-none"
                  style={{ fontSize: "13px" }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import emptyStateImg from "figma:asset/809ecd82052fee700603064b95c5c5dec4db59ba.png";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { getRecentActivities, getSavedDrafts, getTopTemplates, type RecentActivity, type SavedDraft } from "./draftStore";
import { FileText } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-white rounded-2xl px-4 py-5 flex flex-col items-center justify-center min-h-[190px] text-center">
      <img src={emptyStateImg} alt="" className="w-[56px] sm:w-[60px] h-auto mb-3 opacity-70" />
      <p className="text-[#0F172A] mb-1 text-sm sm:text-[15px] font-semibold break-words">
        {text}
      </p>
      <p className="text-[#9CA3AF] text-xs sm:text-[13px] font-normal">
        Start working on a document now
      </p>
    </div>
  );
}

function CardShell({ title, showViewAll = true, onViewAll, children }: { title: string; showViewAll?: boolean; onViewAll?: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-[#F5F5F5] rounded-2xl border border-[#E8E8E8] p-3 sm:p-4 min-h-[250px] flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 min-h-[40px]">
        <h3 className="text-[#0F172A] text-sm sm:text-[15px] font-bold leading-tight break-words">
          {title}
        </h3>
        {showViewAll && (
          <button
            onClick={onViewAll}
            className="bg-white border border-[#D1D5DB] text-[#6B7280] rounded-lg px-3 sm:px-4 py-2 hover:bg-[#F9FAFB] transition text-xs font-normal shrink-0 min-h-10"
          >
            View All
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function BottomCards() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [topTemplates, setTopTemplates] = useState<{ name: string; count: number }[]>([]);

  const sync = useCallback(() => {
    setActivities(getRecentActivities());
    setDrafts(getSavedDrafts());
    setTopTemplates(getTopTemplates(3));
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("lexdraft-counters", sync);
    return () => window.removeEventListener("lexdraft-counters", sync);
  }, [sync]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {/* Drafts - max 3 */}
      <CardShell title={`Drafts (${drafts.length})`} showViewAll={drafts.length > 3} onViewAll={() => navigate("/documents")}>
        {drafts.length === 0 ? (
          <EmptyState text="No draft." />
        ) : (
          <div className="bg-white rounded-2xl p-3 sm:p-4 min-h-[190px] flex flex-col gap-2">
            {drafts.slice(0, 3).map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/templates/${encodeURIComponent(d.templateName)}`)}
                className="flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition text-left cursor-pointer bg-transparent border-none w-full"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[#0F172A] text-xs sm:text-[13px] font-medium break-words">
                    {d.templateName}
                  </p>
                  <p className="text-[#9CA3AF] text-[11px] break-words">
                    {d.finalized ? "Finalized" : "Draft"} &middot; {timeAgo(d.savedAt)}
                  </p>
                </div>
                {d.finalized && (
                  <span className="text-[#22B8C7] bg-[#F0FDFA] px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                    Done
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </CardShell>

      {/* Recent Activities - max 3 */}
      <CardShell title="Recent Activities" showViewAll={activities.length > 3}>
        {activities.length === 0 ? (
          <EmptyState text="No recent activities." />
        ) : (
          <div className="bg-white rounded-2xl p-3 sm:p-4 min-h-[190px] flex flex-col gap-1">
            {activities.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-2 py-2">
                <div className="w-2 h-2 rounded-full bg-[#22B8C7] mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[#0F172A] text-xs sm:text-[13px] font-medium break-words">
                    {a.action}
                  </p>
                  <p className="text-[#9CA3AF] text-[11px] break-words">
                    {a.templateName} &middot; {timeAgo(a.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardShell>

      {/* Quick Template - based on most used */}
      <CardShell title="Quick Template" showViewAll={false}>
        {topTemplates.length === 0 ? (
          <EmptyState text="No quick template." />
        ) : (
          <div className="bg-white rounded-2xl p-3 sm:p-4 min-h-[190px] flex flex-col gap-2">
            {topTemplates.map((t) => (
              <button
                key={t.name}
                onClick={() => navigate(`/templates/${encodeURIComponent(t.name)}`)}
                className="flex items-center gap-3 px-2.5 sm:px-3 py-3 rounded-lg hover:bg-[#F8FAFC] transition text-left cursor-pointer bg-transparent border-none w-full"
              >
                <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-[#22B8C7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0F172A] truncate text-xs sm:text-[13px] font-medium">
                    {t.name}
                  </p>
                  <p className="text-[#9CA3AF] text-[11px]">
                    Used {t.count} time{t.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className="text-[#22B8C7] shrink-0"
                  style={{ fontSize: "18px" }}
                >
                  &rarr;
                </span>
              </button>
            ))}
          </div>
        )}
      </CardShell>
    </div>
  );
}

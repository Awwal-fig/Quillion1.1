import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { FileText, CheckCircle2, Layers, TrendingUp } from "lucide-react";
import {
  getCompletedCount,
  getTemplatesUsedCount,
  getSavedDrafts,
  getRecentActivities,
  getTemplateUsage,
} from "./draftStore";

const CATEGORY_MAP: Record<string, string> = {
  "Motion Ex Parte": "Litigation", "Motion on Notice": "Litigation", "Motion for Interim Injunction": "Litigation",
  "Notice of Preliminary Objection": "Litigation", "Originating Summons": "Litigation", "Writ of Summons": "Litigation",
  "Notice of Appeal": "Litigation", "Statement of claim": "Litigation", "Counter Affidavit": "Litigation",
  "Further Affidavit": "Litigation", "Affidavit of Facts": "Litigation", "Witness Statement on Oath": "Litigation",
  "Written Address": "Litigation", "Motion for Stay of Execution": "Litigation", "Reply on Points of Law": "Litigation",
  "Memorandum of Appearance": "Litigation", "Statement of Claim": "Litigation", "Statement of Defence": "Litigation",
  "Counter Claim": "Litigation", "Reply to Statement of Defence": "Litigation", "Final Written Address": "Litigation",
  "Respondent's Brief": "Litigation", "Appellant's Brief": "Litigation", "Notice to Produce": "Litigation",
  "Trademark Application": "IP", "Patent Filing": "IP", "Copyright Notice": "IP", "IP Assignment Agreement": "IP",
  "Licensing Agreement": "IP", "Cease and Desist Letter": "IP", "NDA for IP": "IP", "IP Due Diligence Report": "IP",
  "Articles of Association": "Corporate", "Board Resolution": "Corporate", "Shareholder Agreement": "Corporate",
  "Memorandum of Understanding": "Corporate", "Corporate Bylaws": "Corporate", "Minutes of Meeting": "Corporate",
  "Power of Attorney": "Corporate", "Certificate of Incorporation": "Corporate",
  "Lease Agreement": "Property", "Deed of Assignment": "Property", "Tenancy Agreement": "Property",
  "Survey Plan": "Property", "Certificate of Occupancy": "Property", "Mortgage Agreement": "Property",
  "Property Sale Agreement": "Property", "Land Use Charge": "Property",
  "Employment Contract": "Employment", "Non-Compete Agreement": "Employment", "Termination Letter": "Employment",
  "Offer Letter": "Employment", "Employee Handbook": "Employment", "Disciplinary Notice": "Employment",
  "Severance Agreement": "Employment", "Workplace Policy": "Employment",
};

const PIE_COLORS = ["#22B8C7", "#0F172A", "#F59E0B", "#10B981", "#8B5CF6", "#EF4444", "#3B82F6"];

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#F0FDFA] flex items-center justify-center">{icon}</div>
        {hint && <span className="text-[#22B8C7]" style={{ fontSize: "11px", fontWeight: 600 }}>{hint}</span>}
      </div>
      <p className="text-[#0F172A]" style={{ fontSize: "26px", fontWeight: 700 }}>{value}</p>
      <p className="text-[#6B7280] mt-1" style={{ fontSize: "12px" }}>{label}</p>
    </div>
  );
}

export function Analytics() {
  const [, setTick] = useState(0);
  const sync = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    window.addEventListener("lexdraft-counters", sync);
    return () => window.removeEventListener("lexdraft-counters", sync);
  }, [sync]);

  const data = useMemo(() => {
    const drafts = getSavedDrafts();
    const activities = getRecentActivities();
    const usage = getTemplateUsage();
    const completed = getCompletedCount();
    const templatesUsed = getTemplatesUsedCount();

    const topTemplates = Object.entries(usage)
      .map(([name, count]) => ({ label: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((t, i) => ({ ...t, fullName: `${t.label}__${i}` }));

    const catCounts: Record<string, number> = {};
    drafts.forEach((d) => {
      const c = CATEGORY_MAP[d.templateName] || "Other";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
    const byCategory = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

    const days: { day: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = activities.filter((a) => {
        const t = new Date(a.timestamp).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      days.push({ day: d.toLocaleDateString("en-US", { weekday: "short" }), count });
    }

    const totalDrafts = drafts.length;
    const finalizedDrafts = drafts.filter((d) => d.finalized).length;
    const completionRate = totalDrafts === 0 ? 0 : Math.round((finalizedDrafts / totalDrafts) * 100);

    return { drafts, completed, templatesUsed, topTemplates, byCategory, days, totalDrafts, finalizedDrafts, completionRate };
  }, []);

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
      <p className="text-[#22B8C7] mb-0.5" style={{ fontSize: "13px", fontWeight: 500 }}>My Workspace</p>
      <h1 className="text-[#0F172A] mb-6" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.3 }}>Analytics</h1>

      {/* Stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-5">
        <StatCard icon={<FileText size={18} className="text-[#22B8C7]" />} label="Total Drafts" value={data.totalDrafts} />
        <StatCard icon={<CheckCircle2 size={18} className="text-[#22B8C7]" />} label="Completed Processes" value={data.completed} />
        <StatCard icon={<Layers size={18} className="text-[#22B8C7]" />} label="Templates Used" value={data.templatesUsed} />
        <StatCard icon={<TrendingUp size={18} className="text-[#22B8C7]" />} label="Completion Rate" value={`${data.completionRate}%`} hint={`${data.finalizedDrafts}/${data.totalDrafts}`} />
      </div>

      {/* Activity over time */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-5 min-w-0">
        <h3 className="text-[#0F172A] mb-4" style={{ fontSize: "15px", fontWeight: 700 }}>Activity (Last 7 Days)</h3>
        <div className="w-full" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" allowDecimals={false} style={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E4E8", fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#22B8C7" strokeWidth={2} dot={{ fill: "#22B8C7", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 min-w-0">
          <h3 className="text-[#0F172A] mb-4" style={{ fontSize: "15px", fontWeight: 700 }}>Top Templates</h3>
          {data.topTemplates.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] sm:h-[220px] text-[#9CA3AF]" style={{ fontSize: "13px" }}>No template usage yet</div>
          ) : (
            <div className="w-full" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topTemplates} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" allowDecimals={false} style={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="fullName" stroke="#9CA3AF" width={130} style={{ fontSize: 11 }} tickFormatter={(v: string) => { const label = v.replace(/__\d+$/, ""); return label.length > 20 ? label.slice(0, 20) + "…" : label; }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E4E8", fontSize: 12 }} />
                  <Bar dataKey="count" fill="#22B8C7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 min-w-0">
          <h3 className="text-[#0F172A] mb-4" style={{ fontSize: "15px", fontWeight: 700 }}>Documents by Category</h3>
          {data.byCategory.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] sm:h-[220px] text-[#9CA3AF]" style={{ fontSize: "13px" }}>No documents yet</div>
          ) : (
            <div className="w-full" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {data.byCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E4E8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {data.byCategory.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[#0F172A]" style={{ fontSize: "11px" }}>{c.name} ({c.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

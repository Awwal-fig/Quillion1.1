import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Search } from "lucide-react";
import { getSavedDrafts, type SavedDraft } from "./draftStore";

const CATEGORY_MAP: Record<string, string> = {
  // Litigation
  "Motion Ex Parte": "Litigation",
  "Motion on Notice": "Litigation",
  "Motion for Interim Injunction": "Litigation",
  "Notice of Preliminary Objection": "Litigation",
  "Originating Summons": "Litigation",
  "Writ of Summons": "Litigation",
  "Notice of Appeal": "Litigation",
  "Statement of claim": "Litigation",
  "Counter Affidavit": "Litigation",
  "Further Affidavit": "Litigation",
  "Affidavit of Facts": "Litigation",
  "Witness Statement on Oath": "Litigation",
  "Written Address": "Litigation",
  "Motion for Stay of Execution": "Litigation",
  "Reply on Points of Law": "Litigation",
  "Memorandum of Appearance": "Litigation",
  "Statement of Claim": "Litigation",
  "Statement of Defence": "Litigation",
  "Counter Claim": "Litigation",
  "Reply to Statement of Defence": "Litigation",
  "Final Written Address": "Litigation",
  "Respondent's Brief": "Litigation",
  "Appellant's Brief": "Litigation",
  "Notice to Produce": "Litigation",
  // IP
  "Trademark Application": "Intellectual Property",
  "Patent Filing": "Intellectual Property",
  "Copyright Notice": "Intellectual Property",
  "IP Assignment Agreement": "Intellectual Property",
  "Licensing Agreement": "Intellectual Property",
  "Cease and Desist Letter": "Intellectual Property",
  "NDA for IP": "Intellectual Property",
  "IP Due Diligence Report": "Intellectual Property",
  // Corporate
  "Articles of Association": "Corporate",
  "Board Resolution": "Corporate",
  "Shareholder Agreement": "Corporate",
  "Memorandum of Understanding": "Corporate",
  "Corporate Bylaws": "Corporate",
  "Minutes of Meeting": "Corporate",
  "Power of Attorney": "Corporate",
  "Certificate of Incorporation": "Corporate",
  // Property
  "Lease Agreement": "Property",
  "Deed of Assignment": "Property",
  "Tenancy Agreement": "Property",
  "Survey Plan": "Property",
  "Certificate of Occupancy": "Property",
  "Mortgage Agreement": "Property",
  "Property Sale Agreement": "Property",
  "Land Use Charge": "Property",
  // Employment
  "Employment Contract": "Employment/HR",
  "Non-Compete Agreement": "Employment/HR",
  "Termination Letter": "Employment/HR",
  "Offer Letter": "Employment/HR",
  "Employee Handbook": "Employment/HR",
  "Disciplinary Notice": "Employment/HR",
  "Severance Agreement": "Employment/HR",
  "Workplace Policy": "Employment/HR",
  // Compliance
  "Regulatory Filing": "Compliance",
  "Compliance Report": "Compliance",
  "Audit Checklist": "Compliance",
  "Risk Assessment": "Compliance",
  "Policy Document": "Compliance",
  "Incident Report": "Compliance",
  "Training Record": "Compliance",
  "Compliance Certificate": "Compliance",
  // ADR
  "Arbitration Clause": "Dispute Resolution / ADR",
  "Mediation Agreement": "Dispute Resolution / ADR",
  "Settlement Agreement": "Dispute Resolution / ADR",
  "Arbitration Notice": "Dispute Resolution / ADR",
  "Conciliation Brief": "Dispute Resolution / ADR",
  "ADR Policy": "Dispute Resolution / ADR",
  "Expert Determination": "Dispute Resolution / ADR",
  "Negotiation Framework": "Dispute Resolution / ADR",
};

const ALL_CATEGORIES = [
  "All Categories",
  "Litigation",
  "Intellectual Property",
  "Corporate",
  "Property",
  "Employment/HR",
  "Compliance",
  "Dispute Resolution / ADR",
];

const STATUSES = ["All Statuses", "Draft", "Finalized"];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function MyDocuments() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialStatus = STATUSES.includes(params.get("status") || "") ? (params.get("status") as string) : "All Statuses";
  const initialCategory = ALL_CATEGORIES.includes(params.get("category") || "") ? (params.get("category") as string) : "All Categories";
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState("");

  const sync = useCallback(() => setDrafts(getSavedDrafts()), []);
  useEffect(() => {
    sync();
    window.addEventListener("lexdraft-counters", sync);
    return () => window.removeEventListener("lexdraft-counters", sync);
  }, [sync]);

  const filtered = useMemo(() => {
    return drafts.filter((d) => {
      const cat = CATEGORY_MAP[d.templateName] || "Other";
      if (category !== "All Categories" && cat !== category) return false;
      if (status === "Draft" && d.finalized) return false;
      if (status === "Finalized" && !d.finalized) return false;
      if (query && !d.templateName.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [drafts, category, status, query]);

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
      <p className="text-[#22B8C7] mb-0.5" style={{ fontSize: "13px", fontWeight: 500 }}>
        My Workspace
      </p>
      <h1 className="text-[#0F172A] mb-6 text-[1.5rem] sm:text-[1.625rem]" style={{ fontWeight: 700, lineHeight: 1.3 }}>
        My Documents
      </h1>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E2E4E8] focus:outline-none focus:border-[#22B8C7] bg-white"
            style={{ fontSize: "13px" }}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-auto py-2 rounded-lg border border-[#E2E4E8] bg-white text-[#0F172A] focus:outline-none focus:border-[#22B8C7] cursor-pointer"
          style={{ fontSize: "13px", paddingLeft: "16px", paddingRight: "16px" }}
        >
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full sm:w-auto py-2 rounded-lg border border-[#E2E4E8] bg-white text-[#0F172A] focus:outline-none focus:border-[#22B8C7] cursor-pointer"
          style={{ fontSize: "13px", paddingLeft: "16px", paddingRight: "16px" }}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <span className="text-[#6B7280] md:ml-auto" style={{ fontSize: "12px" }}>
          {filtered.length} of {drafts.length} document{drafts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Documents list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-10 flex flex-col items-center justify-center min-h-[260px]">
          <div className="w-14 h-14 rounded-full bg-[#F0FDFA] flex items-center justify-center mb-3">
            <FileText size={22} className="text-[#22B8C7]" />
          </div>
          <p className="text-[#0F172A] mb-1" style={{ fontSize: "15px", fontWeight: 600 }}>
            {drafts.length === 0 ? "No documents yet" : "No documents match your filters"}
          </p>
          <p className="text-[#9CA3AF]" style={{ fontSize: "13px" }}>
            {drafts.length === 0 ? "Create one from a template to get started." : "Try a different category or status."}
          </p>
          {drafts.length === 0 && (
            <button
              onClick={() => navigate("/templates")}
              className="mt-4 bg-[#22B8C7] hover:bg-[#1FA3B0] text-white rounded-lg px-4 py-2 transition"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              Browse Templates
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const cat = CATEGORY_MAP[d.templateName] || "Other";
            return (
              <button
                key={d.id}
                onClick={() => navigate(`/templates/${encodeURIComponent(d.templateName)}`)}
                className="bg-white rounded-2xl border border-[#E8E8E8] p-4 text-left hover:border-[#22B8C7] hover:shadow-sm transition cursor-pointer flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-[#22B8C7]" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full ${d.finalized ? "bg-[#F0FDFA] text-[#22B8C7]" : "bg-[#FEF3C7] text-[#B45309]"}`}
                    style={{ fontSize: "10px", fontWeight: 600 }}
                  >
                    {d.finalized ? "Finalized" : "Draft"}
                  </span>
                </div>
                <div>
                  <p className="text-[#0F172A] mb-1 line-clamp-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                    {d.templateName}
                  </p>
                  <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>
                    {cat}
                  </p>
                </div>
                <p className="text-[#9CA3AF] mt-auto" style={{ fontSize: "11px" }}>
                  Updated {formatDate(d.savedAt)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";

const categories = [
  "Litigation",
  "Intellectual Property",
  "Corporate",
  "Property",
  "Employment/HR",
  "Compliance",
  "Dispute Resolution / ADR",
];

const allTemplates: Record<string, string[]> = {
  Litigation: [
    "Motion Ex Parte",
    "Motion on Notice",
    "Motion for Interim Injunction",
    "Notice of Preliminary Objection",
    "Originating Summons",
    "Writ of Summons",
    "Notice of Appeal",
    "Counter Affidavit",
    "Further Affidavit",
    "Affidavit of Facts",
    "Witness Statement on Oath",
    "Written Address",
    "Motion for Stay of Execution",
    "Reply on Points of Law",
    "Memorandum of Appearance",
    "Statement of Claim",
    "Statement of Defence",
    "Counter Claim",
    "Reply to Statement of Defence",
    "Final Written Address",
    "Respondent's Brief",
    "Appellant's Brief",
    "Notice to Produce",
  ],
  "Intellectual Property": [
    "Trademark Application",
    "Patent Filing",
    "Copyright Notice",
    "IP Assignment Agreement",
    "Licensing Agreement",
    "Cease and Desist Letter",
    "NDA for IP",
    "IP Due Diligence Report",
  ],
  Corporate: [
    "Articles of Association",
    "Board Resolution",
    "Shareholder Agreement",
    "Memorandum of Understanding",
    "Corporate Bylaws",
    "Minutes of Meeting",
    "Power of Attorney",
    "Certificate of Incorporation",
  ],
  Property: [
    "Lease Agreement",
    "Deed of Assignment",
    "Tenancy Agreement",
    "Survey Plan",
    "Certificate of Occupancy",
    "Mortgage Agreement",
    "Property Sale Agreement",
    "Land Use Charge",
  ],
  "Employment/HR": [
    "Employment Contract",
    "Non-Compete Agreement",
    "Termination Letter",
    "Offer Letter",
    "Employee Handbook",
    "Disciplinary Notice",
    "Severance Agreement",
    "Workplace Policy",
  ],
  Compliance: [
    "Regulatory Filing",
    "Compliance Report",
    "Audit Checklist",
    "Risk Assessment",
    "Policy Document",
    "Incident Report",
    "Training Record",
    "Compliance Certificate",
  ],
  "Dispute Resolution / ADR": [
    "Arbitration Clause",
    "Mediation Agreement",
    "Settlement Agreement",
    "Arbitration Notice",
    "Conciliation Brief",
    "ADR Policy",
    "Expert Determination",
    "Negotiation Framework",
  ],
};

function DocIcon({ name }: { name: string }) {
  return (
    <div className="w-[88px] sm:w-[90px] h-[112px] sm:h-[115px] bg-white border border-[#E2E4E8] rounded-[4px] flex flex-col px-3 py-2.5 gap-[5px] relative">
      {/* Colored dots top-right */}
      <div className="absolute top-[6px] left-[6px] flex gap-[3px]">
        <div className="w-[4px] h-[4px] rounded-full bg-[#EF4444]" />
        <div className="w-[4px] h-[4px] rounded-full bg-[#F59E0B]" />
        <div className="w-[4px] h-[4px] rounded-full bg-[#22C55E]" />
      </div>
      {/* Fake header text */}
      <p className="text-[#94A3B8] mt-1" style={{ fontSize: "5px", fontWeight: 600, lineHeight: 1.2 }}>
        {name}
      </p>
      {/* Lines */}
      <div className="flex flex-col gap-[4px] mt-1">
        <div className="w-full h-[2px] bg-[#E2E4E8] rounded-full" />
        <div className="w-full h-[2px] bg-[#E2E4E8] rounded-full" />
        <div className="w-[75%] h-[2px] bg-[#E2E4E8] rounded-full" />
        <div className="w-full h-[2px] bg-[#E2E4E8] rounded-full" />
        <div className="w-full h-[2px] bg-[#E2E4E8] rounded-full" />
        <div className="w-[60%] h-[2px] bg-[#E2E4E8] rounded-full" />
        <div className="w-full h-[2px] bg-[#F0F0F0] rounded-full" />
        <div className="w-full h-[2px] bg-[#F0F0F0] rounded-full" />
      </div>
    </div>
  );
}

export function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("Litigation");
  const [entriesPerPage, setEntriesPerPage] = useState(16);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const templates = allTemplates[activeCategory] || [];
  const totalEntries = templates.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const visibleTemplates = templates.slice(startIndex, startIndex + entriesPerPage);
  const showingStart = startIndex + 1;
  const showingEnd = Math.min(startIndex + entriesPerPage, totalEntries);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 pb-32 sm:pb-28">
      {/* Category Tabs */}
      <div className="flex items-center gap-4 md:gap-8 border-b border-[#E5E7EB] mb-6 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`pb-3 cursor-pointer bg-transparent border-none outline-none whitespace-nowrap ${
              activeCategory === cat
                ? "text-[#0F172A] border-b-2 border-[#0F172A]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
            style={{
              fontSize: "14px",
              fontWeight: activeCategory === cat ? 600 : 400,
              marginBottom: "-1px",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-3 md:gap-x-4 gap-y-6 md:gap-y-8">
        {visibleTemplates.map((name) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => navigate(`/templates/${encodeURIComponent(name)}`)}
          >
            <div className="group-hover:shadow-md group-hover:scale-[1.03] transition-all">
              <DocIcon name={name} />
            </div>
            <span
              className="text-[#0F172A] text-center max-w-[110px]"
              style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.4 }}
            >
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#E5E7EB] px-4 md:px-6 lg:px-10 py-3 md:py-4 z-50">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 500 }}>
              Show
            </span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#22B8C7] text-[#22B8C7] rounded-md px-2 py-1 bg-white outline-none cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {[10, 16, 24].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 500 }}>
              Entries
            </span>
            <span className="text-[#6B7280] ml-4" style={{ fontSize: "13px" }}>
              Showing {showingStart} - {showingEnd} of {totalEntries} entries
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 text-[#6B7280] hover:text-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <span style={{ fontSize: "10px" }}>◀</span> Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-[#0F172A] hover:text-[#22B8C7] disabled:opacity-40 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              Next <span style={{ fontSize: "10px" }}>▶</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

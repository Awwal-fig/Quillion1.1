import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Mic, MicOff, X } from "lucide-react";

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

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition() {
  const browserWindow = window as typeof window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };

  return browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition;
}

export function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("Litigation");
  const [entriesPerPage, setEntriesPerPage] = useState(16);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [draftingContext, setDraftingContext] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
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

  const openContextForm = (name: string) => {
    setSelectedTemplate(name);
    setDraftingContext("");
    setVoiceError(null);
  };

  const closeContextForm = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setSelectedTemplate(null);
    setDraftingContext("");
    setVoiceError(null);
  };

  const toggleVoiceCapture = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setVoiceError("Voice input is not available in this browser. You can still type the case history below.");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setDraftingContext(transcript.trimStart());
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setVoiceError(null);
    setIsListening(true);
    recognition.start();
  };

  const startTemplateDraft = () => {
    if (!selectedTemplate) return;
    navigate(`/templates/${encodeURIComponent(selectedTemplate)}`, {
      state: { draftingContext: draftingContext.trim() },
    });
  };

  useEffect(() => () => recognitionRef.current?.stop(), []);

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
            onClick={() => openContextForm(name)}
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


      {selectedTemplate && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/50 px-4 py-6">
          <div className="w-full max-w-[640px] rounded-2xl bg-white shadow-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 sm:px-6 py-5">
              <div>
                <p className="text-[#22B8C7]" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Context first
                </p>
                <h2 className="text-[#0F172A] mt-1" style={{ fontSize: "20px", fontWeight: 700 }}>
                  Tell Quillion about this {selectedTemplate}
                </h2>
                <p className="text-[#64748B] mt-2" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                  Add the case history, facts, parties, goals, reliefs, constraints, or anything the AI should know before opening the draft.
                </p>
              </div>
              <button
                onClick={closeContextForm}
                className="p-2 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition bg-transparent border-none cursor-pointer"
                aria-label="Close context form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <label htmlFor="drafting-context" className="text-[#0F172A]" style={{ fontSize: "14px", fontWeight: 600 }}>
                  Case / drafting context
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceCapture}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition cursor-pointer ${
                    isListening
                      ? "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
                      : "bg-[#F0FDFA] border-[#CCFBF1] text-[#0D9488] hover:bg-[#CCFBF1]"
                  }`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  {isListening ? "Stop voice" : "Use voice"}
                </button>
              </div>
              <textarea
                id="drafting-context"
                value={draftingContext}
                onChange={(event) => setDraftingContext(event.target.value)}
                rows={9}
                placeholder="Example: Client paid for goods that were never delivered. Include dates, parties, documents, desired reliefs, urgent deadlines, and the tone you want..."
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-xl bg-white text-[#0F172A] outline-none focus:border-[#22B8C7] resize-none"
                style={{ fontSize: "14px", lineHeight: 1.7 }}
                autoFocus
              />
              {voiceError && (
                <p className="mt-2 text-[#DC2626]" style={{ fontSize: "12px" }}>
                  {voiceError}
                </p>
              )}
              <p className="mt-2 text-[#64748B]" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                You can continue without context, but adding details helps the draft and AI suggestions start from the right facts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 bg-[#F8FAFC] border-t border-[#E5E7EB] px-5 sm:px-6 py-4">
              <button
                onClick={closeContextForm}
                className="px-4 py-2.5 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] hover:bg-[#F9FAFB] transition cursor-pointer"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={startTemplateDraft}
                className="px-4 py-2.5 bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg transition cursor-pointer"
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Open draft with context
              </button>
            </div>
          </div>
        </div>
      )}

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

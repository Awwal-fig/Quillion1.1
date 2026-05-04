import { useState, FormEvent } from "react";
import { ChevronDown, Mail, MessageCircle, BookOpen, LifeBuoy, Send, Check, Phone } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "./auth";

const TICKETS_KEY = "quillon_support_tickets";

interface Ticket {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
  status: "Open" | "Resolved";
}

const FAQS = [
  {
    q: "How do I create my first document?",
    a: "Go to the Templates page from the dashboard, pick a category and a template, then fill in the sidebar fields. The document on the right updates as you type. When you're ready, click Save or Finalize.",
  },
  {
    q: "Can I edit a finalized document later?",
    a: "Yes. Open it from My Documents and you can keep editing. Finalizing only marks it complete for tracking — it does not lock the file.",
  },
  {
    q: "How does the AI Assistant work?",
    a: "The AI panel reads where your cursor is in the document and suggests context-aware actions: replacing informal language, adding case-law citations, running compliance checks, or inserting standard clauses. Click any suggestion to apply it.",
  },
  {
    q: "Is my data stored on a server?",
    a: "Right now drafts, activity, and preferences are stored locally in your browser. Connecting Quillon to a backend (Supabase) is on the roadmap and will enable cloud sync, multi-device access, and team sharing.",
  },
  {
    q: "How do I export a document as PDF?",
    a: "Open the draft, click Export PDF in the top toolbar. The file downloads as a print-ready HTML file you can open and save as PDF from your browser's print dialog.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: "On the sign-in page, click 'Forgot password?'. Enter your email to receive a 6-digit verification code, then set a new password.",
  },
  {
    q: "How do I add multiple parties to a litigation document?",
    a: "In the editor sidebar for litigation templates, the Applicant/Claimant and Respondent/Defendant fields have an 'Add Party' button. Each added party appears as '1st Applicant', '2nd Applicant', etc., in the BETWEEN block.",
  },
  {
    q: "Can I customize templates?",
    a: "You can edit the document content directly in the canvas while drafting. Saving a custom version per-template (template authoring) is a planned feature.",
  },
];

const CATEGORIES = ["General Question", "Bug Report", "Template Request", "Account / Billing", "Feature Request", "Other"];

function loadTickets(): Ticket[] {
  try { return JSON.parse(localStorage.getItem(TICKETS_KEY) || "[]"); }
  catch { return []; }
}

function saveTicket(t: Ticket) {
  const all = loadTickets();
  all.unshift(t);
  localStorage.setItem(TICKETS_KEY, JSON.stringify(all.slice(0, 50)));
}

function ResourceCard({ icon, title, description, action, to, comingSoon }: { icon: React.ReactNode; title: string; description: string; action: string; to?: string; comingSoon?: boolean }) {
  const inner = (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#F0FDFA] flex items-center justify-center text-[#22B8C7]">{icon}</div>
        {comingSoon && (
          <span
            className="px-2 py-0.5 rounded-full"
            style={{
              fontSize: "10px",
              fontWeight: 600,
              background: "#FEF3C7",
              color: "#92400E",
              border: "1px solid #FCD34D",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-[#0F172A] mb-1" style={{ fontSize: "15px", fontWeight: 700 }}>{title}</h3>
      <p className="text-[#6B7280] mb-3" style={{ fontSize: "12px", lineHeight: 1.5 }}>{description}</p>
      <span className="inline-flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 600, color: comingSoon ? "#9CA3AF" : "#22B8C7" }}>
        {action} {!comingSoon && <span style={{ fontSize: "14px" }}>&rarr;</span>}
      </span>
    </>
  );
  const cls = `bg-white rounded-2xl border border-[#E8E8E8] p-5 transition block ${comingSoon ? "opacity-80 cursor-not-allowed" : "hover:border-[#22B8C7] cursor-pointer"}`;
  if (comingSoon) return <div className={cls}>{inner}</div>;
  if (to) return <Link to={to} className={cls} style={{ textDecoration: "none" }}>{inner}</Link>;
  return <div className={cls}>{inner}</div>;
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[#E8E8E8] last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-4 bg-transparent border-none cursor-pointer"
      >
        <span className="text-[#0F172A] pr-4" style={{ fontSize: "14px", fontWeight: 600 }}>{q}</span>
        <ChevronDown size={16} className={`text-[#6B7280] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="text-[#6B7280] pb-4 pr-8" style={{ fontSize: "13px", lineHeight: 1.7 }}>{a}</p>
      )}
    </div>
  );
}

export function Support() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveTicket({
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      category,
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: "Open",
    });
    setSubmitted(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  const inputCls = "w-full py-2.5 rounded-lg border border-[#E2E4E8] bg-white text-[#0F172A] focus:outline-none focus:border-[#22B8C7]";
  const inputStyle = { fontSize: "13px", paddingLeft: "16px", paddingRight: "16px" };

  return (
    <main className="max-w-[1100px] mx-auto px-10 py-6">
      <p className="text-[#22B8C7] mb-0.5" style={{ fontSize: "13px", fontWeight: 500 }}>Support Center</p>
      <h1 className="text-[#0F172A] mb-2" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.3 }}>How can we help?</h1>
      <p className="text-[#6B7280] mb-6" style={{ fontSize: "14px" }}>
        Find quick answers in the FAQ, browse resources, or open a ticket and we'll get back to you.
      </p>

      {/* Resource cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <ResourceCard icon={<BookOpen size={18} />} title="Documentation" description="Step-by-step guides for templates, drafting, and the AI assistant." action="Read docs" to="/docs" />
        <ResourceCard icon={<MessageCircle size={18} />} title="Community" description="Ask questions and trade tips with other Nigerian legal practitioners." action="Join the forum" comingSoon />
        <ResourceCard icon={<LifeBuoy size={18} />} title="Status & Updates" description="Check live system status and read what's new in the latest release." action="View status" />
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* FAQ */}
        <div className="col-span-3">
          <h2 className="text-[#0F172A] mb-3" style={{ fontSize: "17px", fontWeight: 700 }}>Frequently asked questions</h2>
          <div className="bg-white rounded-2xl border border-[#E8E8E8] px-5">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>

        {/* Contact / ticket form */}
        <div className="col-span-2">
          <h2 className="text-[#0F172A] mb-3" style={{ fontSize: "17px", fontWeight: 700 }}>Contact support</h2>
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-4">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-3">
                  <Check size={20} className="text-[#065F46]" />
                </div>
                <p className="text-[#0F172A] mb-1" style={{ fontSize: "14px", fontWeight: 700 }}>Ticket submitted</p>
                <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>We'll reply by email within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <label className="block">
                  <span className="text-[#0F172A] mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Name</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} />
                </label>
                <label className="block">
                  <span className="text-[#0F172A] mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Email</span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={inputStyle} />
                </label>
                <label className="block">
                  <span className="text-[#0F172A] mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Category</span>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls + " cursor-pointer"} style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[#0F172A] mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Subject</span>
                  <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Briefly describe the issue" className={inputCls} style={inputStyle} />
                </label>
                <label className="block">
                  <span className="text-[#0F172A] mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Message</span>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's happening..."
                    className={inputCls}
                    style={{ ...inputStyle, paddingTop: "10px", paddingBottom: "10px", resize: "vertical" }}
                  />
                </label>
                <button
                  type="submit"
                  className="bg-[#22B8C7] hover:bg-[#1FA3B0] text-white rounded-lg py-2.5 transition flex items-center justify-center gap-2 mt-1"
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  <Send size={14} /> Submit Ticket
                </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
            <h3 className="text-[#0F172A] mb-3" style={{ fontSize: "14px", fontWeight: 700 }}>Other ways to reach us</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] flex items-center justify-center text-[#22B8C7]"><Mail size={15} /></div>
                <div>
                  <p className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 500 }}>support@quillon.app</p>
                  <p className="text-[#9CA3AF]" style={{ fontSize: "11px" }}>Response within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F0FDFA] flex items-center justify-center text-[#22B8C7]"><Phone size={15} /></div>
                <div>
                  <p className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 500 }}>+234 800 QUILLON</p>
                  <p className="text-[#9CA3AF]" style={{ fontSize: "11px" }}>Mon–Fri, 9am–6pm WAT</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BookOpen, Sparkles, FileText, Layers, Shield, Download, HelpCircle } from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  body: { heading?: string; text?: string; bullets?: string[] }[];
}

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: <Sparkles size={16} />,
    body: [
      { text: "Quillon helps Nigerian legal practitioners draft, finalize, and track legal documents. This guide walks you through the core flow." },
      { heading: "Create an account", text: "Sign up with your full name, email, and a strong password (8+ characters with an uppercase letter and a special character). You'll be signed in automatically once your account is created." },
      { heading: "Your dashboard", text: "After signing in, the dashboard shows your recent activity, quick stats, and shortcuts to start a new application or review completed ones." },
    ],
  },
  {
    id: "templates",
    title: "Working with templates",
    icon: <Layers size={16} />,
    body: [
      { text: "Templates are organized by practice area: Litigation, IP, Corporate, Property, and Employment." },
      { bullets: [
        "Open the Templates page from the top nav.",
        "Pick a category to filter, then choose a template card.",
        "Fill in the sidebar fields — the document on the right updates as you type.",
        "For litigation templates with multiple parties, use 'Add Party' to insert 1st, 2nd, 3rd applicants/respondents.",
      ] },
    ],
  },
  {
    id: "drafting",
    title: "Drafting & AI assistant",
    icon: <FileText size={16} />,
    body: [
      { text: "The drafting canvas is fully editable. Place your cursor anywhere in the document and the AI panel offers context-aware actions." },
      { bullets: [
        "Replace informal language with formal legal phrasing.",
        "Insert relevant Nigerian case-law citations.",
        "Run a compliance check against current legal standards.",
        "Add standard clauses (jurisdiction, severability, indemnity).",
      ] },
      { text: "Click any AI suggestion to apply it directly into the document." },
    ],
  },
  {
    id: "saving",
    title: "Saving, finalizing & exporting",
    icon: <Download size={16} />,
    body: [
      { heading: "Save", text: "Click Save in the toolbar to persist your draft. Saved drafts appear under My Documents." },
      { heading: "Finalize", text: "Marking a draft as Finalized records it as a completed process for your analytics. You can still edit it afterward — finalize is a status, not a lock." },
      { heading: "Export", text: "Click Export and choose “Download as PDF” or “Download as Word (.docx)" },
    ],
  },
  {
    id: "documents",
    title: "Managing My Documents",
    icon: <BookOpen size={16} />,
    body: [
      { text: "My Documents lists everything you've drafted. Filter by category, status (Draft / Finalized), or search by title." },
      { bullets: [
        "Click any card to reopen and continue editing.",
        "Use status filters from the dashboard's quick links.",
        "Document counters on the dashboard update in real time as you save or finalize.",
      ] },
    ],
  },
  {
    id: "account",
    title: "Account & security",
    icon: <Shield size={16} />,
    body: [
      { heading: "Reset your password", text: "On the sign-in screen, click 'Forgot password?'. Enter your account email and we'll send a secure recovery link. The link expires in 1 hour." },
      { heading: "Appearance", text: "Settings → Appearance lets you switch between System, Light, and Dark themes. Your choice is remembered across sessions." },
      { heading: "Data management", text: "Settings → Data Management lets you reset all local preferences and drafts. This action cannot be undone." },
    ],
  },
  {
    id: "faq",
    title: "Common questions",
    icon: <HelpCircle size={16} />,
    body: [
      { text: "Most quick questions are answered on the Help & Support page under Frequently Asked Questions. If you can't find what you need, open a ticket and we'll respond by email within 24 hours." },
    ],
  },
];

export function Documentation() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <main className="max-w-[1200px] mx-auto px-10 py-6">
      <Link to="/support" className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#0F172A] mb-4" style={{ fontSize: "13px" }}>
        <ArrowLeft size={14} /> Back to Support
      </Link>
      <p className="text-[#22B8C7] mb-0.5" style={{ fontSize: "13px", fontWeight: 500 }}>Quillon Docs</p>
      <h1 className="text-[#0F172A] mb-2" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.3 }}>Documentation</h1>
      <p className="text-[#6B7280] mb-6" style={{ fontSize: "14px" }}>
        Everything you need to draft confidently in Quillon — from your first template to finalizing a brief.
      </p>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-[#E8E8E8] p-3 h-fit sticky top-6">
          <nav className="flex flex-col">
            {SECTIONS.map((s) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-left bg-transparent border-none cursor-pointer transition"
                  style={{
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#0F172A" : "#6B7280",
                    background: isActive ? "#F0FDFA" : "transparent",
                  }}
                >
                  <span style={{ color: isActive ? "#22B8C7" : "#9CA3AF" }}>{s.icon}</span>
                  {s.title}
                </button>
              );
            })}
          </nav>
        </aside>

        <article className="bg-white rounded-2xl border border-[#E8E8E8] p-7">
          <h2 className="text-[#0F172A] mb-5 flex items-center gap-2" style={{ fontSize: "20px", fontWeight: 700 }}>
            <span className="text-[#22B8C7]">{current.icon}</span>
            {current.title}
          </h2>
          <div className="flex flex-col gap-4">
            {current.body.map((b, i) => (
              <div key={i}>
                {b.heading && <h3 className="text-[#0F172A] mb-1.5" style={{ fontSize: "14px", fontWeight: 700 }}>{b.heading}</h3>}
                {b.text && <p className="text-[#374151]" style={{ fontSize: "14px", lineHeight: 1.7 }}>{b.text}</p>}
                {b.bullets && (
                  <ul className="flex flex-col gap-1.5 mt-1 pl-5" style={{ listStyle: "disc" }}>
                    {b.bullets.map((bullet, j) => (
                      <li key={j} className="text-[#374151]" style={{ fontSize: "14px", lineHeight: 1.6 }}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}

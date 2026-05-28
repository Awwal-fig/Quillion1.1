import { useState, useEffect } from "react";
import { User, Bell, Palette, Shield, Database, Trash2, Check, Monitor, Sun, Moon } from "lucide-react";
import { useAuth } from "./auth";

type ThemeMode = "system" | "light" | "dark";

const PREFS_KEY = "lexdraft_preferences";

interface Preferences {
  fullName: string;
  email: string;
  firmName: string;
  jurisdiction: string;
  notifyEmail: boolean;
  notifyDeadlines: boolean;
  notifyAi: boolean;
  autosave: boolean;
  defaultCourt: string;
  signature: string;
  theme: ThemeMode;
}

const DEFAULTS: Preferences = {
  fullName: "",
  email: "",
  firmName: "",
  jurisdiction: "Lagos State",
  notifyEmail: true,
  notifyDeadlines: true,
  notifyAi: false,
  autosave: true,
  defaultCourt: "State High Court",
  signature: "",
  theme: "system",
};

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolved = mode === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : mode;
  root.classList.toggle("dark", resolved === "dark");
}

function ThemeIllustration({ variant }: { variant: ThemeMode }) {
  if (variant === "light") {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-auto">
        <rect width="160" height="100" rx="8" fill="#F8FAFC" />
        <rect x="12" y="12" width="136" height="14" rx="3" fill="#FFFFFF" stroke="#E2E4E8" />
        <circle cx="20" cy="19" r="2.5" fill="#22B8C7" />
        <rect x="28" y="17" width="40" height="4" rx="2" fill="#0F172A" />
        <rect x="12" y="32" width="64" height="56" rx="4" fill="#FFFFFF" stroke="#E2E4E8" />
        <rect x="18" y="40" width="40" height="4" rx="2" fill="#0F172A" />
        <rect x="18" y="50" width="52" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="18" y="58" width="44" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="18" y="74" width="24" height="8" rx="2" fill="#22B8C7" />
        <rect x="84" y="32" width="64" height="26" rx="4" fill="#FFFFFF" stroke="#E2E4E8" />
        <rect x="84" y="62" width="64" height="26" rx="4" fill="#FFFFFF" stroke="#E2E4E8" />
        <circle cx="138" cy="19" r="4" fill="#FCD34D" />
      </svg>
    );
  }
  if (variant === "dark") {
    return (
      <svg viewBox="0 0 160 100" className="w-full h-auto">
        <rect width="160" height="100" rx="8" fill="#0F172A" />
        <rect x="12" y="12" width="136" height="14" rx="3" fill="#1E293B" stroke="#334155" />
        <circle cx="20" cy="19" r="2.5" fill="#22B8C7" />
        <rect x="28" y="17" width="40" height="4" rx="2" fill="#E2E8F0" />
        <rect x="12" y="32" width="64" height="56" rx="4" fill="#1E293B" stroke="#334155" />
        <rect x="18" y="40" width="40" height="4" rx="2" fill="#E2E8F0" />
        <rect x="18" y="50" width="52" height="3" rx="1.5" fill="#475569" />
        <rect x="18" y="58" width="44" height="3" rx="1.5" fill="#475569" />
        <rect x="18" y="74" width="24" height="8" rx="2" fill="#22B8C7" />
        <rect x="84" y="32" width="64" height="26" rx="4" fill="#1E293B" stroke="#334155" />
        <rect x="84" y="62" width="64" height="26" rx="4" fill="#1E293B" stroke="#334155" />
        <circle cx="138" cy="19" r="4" fill="#E2E8F0" />
        <circle cx="135" cy="17" r="3" fill="#0F172A" />
      </svg>
    );
  }
  // system - split
  return (
    <svg viewBox="0 0 160 100" className="w-full h-auto">
      <defs>
        <clipPath id="lhalf"><rect x="0" y="0" width="80" height="100" /></clipPath>
        <clipPath id="rhalf"><rect x="80" y="0" width="80" height="100" /></clipPath>
      </defs>
      <g clipPath="url(#lhalf)">
        <rect width="160" height="100" rx="8" fill="#F8FAFC" />
        <rect x="12" y="12" width="136" height="14" rx="3" fill="#FFFFFF" stroke="#E2E4E8" />
        <circle cx="20" cy="19" r="2.5" fill="#22B8C7" />
        <rect x="28" y="17" width="40" height="4" rx="2" fill="#0F172A" />
        <rect x="12" y="32" width="64" height="56" rx="4" fill="#FFFFFF" stroke="#E2E4E8" />
        <rect x="18" y="40" width="40" height="4" rx="2" fill="#0F172A" />
        <rect x="18" y="50" width="52" height="3" rx="1.5" fill="#CBD5E1" />
        <rect x="18" y="74" width="24" height="8" rx="2" fill="#22B8C7" />
      </g>
      <g clipPath="url(#rhalf)">
        <rect width="160" height="100" rx="8" fill="#0F172A" />
        <rect x="12" y="12" width="136" height="14" rx="3" fill="#1E293B" stroke="#334155" />
        <rect x="84" y="32" width="64" height="26" rx="4" fill="#1E293B" stroke="#334155" />
        <rect x="84" y="62" width="64" height="26" rx="4" fill="#1E293B" stroke="#334155" />
        <rect x="90" y="40" width="34" height="4" rx="2" fill="#E2E8F0" />
        <rect x="90" y="70" width="34" height="4" rx="2" fill="#E2E8F0" />
      </g>
      <line x1="80" y1="0" x2="80" y2="100" stroke="#22B8C7" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; description: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", description: "Match your device.", Icon: Monitor },
  { value: "light", label: "Light", description: "Clean and bright.", Icon: Sun },
  { value: "dark", label: "Dark", description: "Easy on the eyes.", Icon: Moon },
];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina",
  "Kebbi","Kogi","Kwara","Lagos State","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau",
  "Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const COURTS = ["Supreme Court", "Court of Appeal", "Federal High Court", "State High Court", "Magistrate Court"];

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function SectionCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 sm:p-5 mb-4 sm:mb-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <h3 className="text-[#0F172A]" style={{ fontSize: "15px", fontWeight: 700 }}>{title}</h3>
          <p className="text-[#6B7280] mt-0.5" style={{ fontSize: "12px" }}>{description}</p>
        </div>
      </div>
      <div className="pl-0 sm:pl-[52px]">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-[#0F172A] mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full py-2 rounded-lg border border-[#E2E4E8] bg-white text-[#0F172A] focus:outline-none focus:border-[#22B8C7]";
const inputStyle = { fontSize: "13px", paddingLeft: "16px", paddingRight: "16px" };

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 500 }}>{label}</p>
        <p className="text-[#6B7280] mt-0.5" style={{ fontSize: "12px" }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition shrink-0 ${checked ? "bg-[#22B8C7]" : "bg-[#E2E4E8]"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export function Settings() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPrefs((p) => ({
      ...p,
      fullName: user.fullName,
      email: user.email,
    }));
  }, [user]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(t);
  }, [saved]);

  useEffect(() => {
    applyTheme(prefs.theme);
    if (prefs.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [prefs.theme]);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setSaved(true);
  };

  const handleResetData = () => {
    ["lexdraft_completed_count", "lexdraft_templates_used", "lexdraft_saved_drafts",
     "lexdraft_recent_activities", "lexdraft_template_usage"].forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("lexdraft-counters"));
    setConfirmReset(false);
  };

  return (
    <main className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
      <p className="text-[#22B8C7] mb-0.5" style={{ fontSize: "13px", fontWeight: 500 }}>My Workspace</p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-[#0F172A]" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.3 }}>Settings</h1>
        <button
          onClick={handleSave}
          className="bg-[#22B8C7] hover:bg-[#1FA3B0] text-white rounded-lg py-2 transition flex items-center gap-2"
          style={{ fontSize: "13px", fontWeight: 500, paddingLeft: "16px", paddingRight: "16px" }}
        >
          {saved ? <><Check size={14} /> Saved</> : "Save Changes"}
        </button>
      </div>

      <SectionCard icon={<User size={18} className="text-[#22B8C7]" />} title="Profile" description="Identity used on documents and signatures.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name">
            <input
              className={inputCls}
              style={{ ...inputStyle, background: "#F8FAFC", color: "#6B7280", cursor: "not-allowed" }}
              value={prefs.fullName}
              readOnly
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              style={{ ...inputStyle, background: "#F8FAFC", color: "#6B7280", cursor: "not-allowed" }}
              value={prefs.email}
              readOnly
            />
          </Field>
          <Field label="Law Firm / Chambers">
            <input className={inputCls} style={inputStyle} value={prefs.firmName} onChange={(e) => update("firmName", e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Default Jurisdiction">
            <select className={inputCls + " cursor-pointer"} style={inputStyle} value={prefs.jurisdiction} onChange={(e) => update("jurisdiction", e.target.value)}>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Signature Block">
          <textarea
            rows={3}
            className={inputCls}
            style={{ ...inputStyle, paddingTop: "10px", paddingBottom: "10px", resize: "vertical" }}
            placeholder="Counsel for the Applicant&#10;Chambers Address&#10;Phone, Email"
            value={prefs.signature}
            onChange={(e) => update("signature", e.target.value)}
          />
        </Field>
      </SectionCard>

      <SectionCard icon={<Palette size={18} className="text-[#22B8C7]" />} title="Appearance" description="Pick how Quillion looks. System matches your device automatically.">
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, description, Icon }) => {
            const selected = prefs.theme === value;
            return (
              <button
                key={value}
                onClick={() => update("theme", value)}
                className={`text-left rounded-xl border-2 p-3 transition bg-white ${selected ? "border-[#22B8C7] shadow-sm" : "border-[#E2E4E8] hover:border-[#CBD5E1]"}`}
              >
                <div className="rounded-lg overflow-hidden mb-3 bg-[#F8FAFC]">
                  <ThemeIllustration variant={value} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-[#22B8C7]" />
                    <span className="text-[#0F172A]" style={{ fontSize: "13px", fontWeight: 600 }}>{label}</span>
                  </div>
                  {selected && (
                    <span className="w-4 h-4 rounded-full bg-[#22B8C7] flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </span>
                  )}
                </div>
                <p className="text-[#6B7280] mt-1" style={{ fontSize: "11px" }}>{description}</p>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard icon={<Palette size={18} className="text-[#22B8C7]" />} title="Drafting Preferences" description="Defaults applied when starting new documents.">
        <Field label="Default Court">
          <select className={inputCls + " cursor-pointer"} style={inputStyle} value={prefs.defaultCourt} onChange={(e) => update("defaultCourt", e.target.value)}>
            {COURTS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Toggle
          checked={prefs.autosave}
          onChange={(v) => update("autosave", v)}
          label="Autosave Drafts"
          description="Save changes automatically every few seconds while editing."
        />
      </SectionCard>

      <SectionCard icon={<Bell size={18} className="text-[#22B8C7]" />} title="Notifications" description="Choose what we ping you about.">
        <Toggle checked={prefs.notifyEmail} onChange={(v) => update("notifyEmail", v)} label="Email Notifications" description="Receive a digest of activity to your inbox." />
        <Toggle checked={prefs.notifyDeadlines} onChange={(v) => update("notifyDeadlines", v)} label="Hearing & Filing Deadlines" description="Get reminders for upcoming court dates." />
        <Toggle checked={prefs.notifyAi} onChange={(v) => update("notifyAi", v)} label="AI Suggestion Alerts" description="Notify when the AI flags compliance issues." />
      </SectionCard>

      <SectionCard icon={<Shield size={18} className="text-[#22B8C7]" />} title="Security" description="Account security controls.">
        <button className="bg-white border border-[#E2E4E8] text-[#0F172A] rounded-lg py-2 hover:bg-[#F8FAFC] transition mr-2" style={{ fontSize: "13px", fontWeight: 500, paddingLeft: "16px", paddingRight: "16px" }}>
          Change Password
        </button>
        <button className="bg-white border border-[#E2E4E8] text-[#0F172A] rounded-lg py-2 hover:bg-[#F8FAFC] transition" style={{ fontSize: "13px", fontWeight: 500, paddingLeft: "16px", paddingRight: "16px" }}>
          Enable Two-Factor Auth
        </button>
      </SectionCard>

      <SectionCard icon={<Database size={18} className="text-[#22B8C7]" />} title="Data Management" description="Your drafts and activity are stored locally in this browser.">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="bg-white border border-[#FCA5A5] text-[#DC2626] rounded-lg py-2 hover:bg-[#FEF2F2] transition flex items-center gap-2"
            style={{ fontSize: "13px", fontWeight: 500, paddingLeft: "16px", paddingRight: "16px" }}
          >
            <Trash2 size={14} /> Reset All Workspace Data
          </button>
        ) : (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-4">
            <p className="text-[#991B1B] mb-3" style={{ fontSize: "13px", fontWeight: 500 }}>
              This will permanently delete all drafts, counters, and activity. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetData}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg py-2 transition"
                style={{ fontSize: "13px", fontWeight: 500, paddingLeft: "16px", paddingRight: "16px" }}
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="bg-white border border-[#E2E4E8] text-[#0F172A] rounded-lg py-2 hover:bg-[#F8FAFC] transition"
                style={{ fontSize: "13px", fontWeight: 500, paddingLeft: "16px", paddingRight: "16px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </main>
  );
}

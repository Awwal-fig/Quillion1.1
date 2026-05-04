import { useState, FormEvent, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Check, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "./auth";
import { Logo } from "./Logo";

const inputCls = "w-full py-3 rounded-xl border border-[#E2E4E8] bg-white text-[#0F172A] focus:outline-none focus:border-[#22B8C7] focus:ring-2 focus:ring-[#22B8C7]/20 transition";
const inputStyle = { fontSize: "13px", paddingLeft: "44px", paddingRight: "44px" };

interface PasswordRule {
  label: string;
  test: (s: string) => boolean;
}

const RULES: PasswordRule[] = [
  { label: "8 Characters", test: (s) => s.length >= 8 },
  { label: "Uppercase Letter", test: (s) => /[A-Z]/.test(s) },
  { label: "Special Character", test: (s) => /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(s) },
];

function PasswordRules({ value }: { value: string }) {
  return (
    <div className="mt-3">
      <p className="text-[#0F172A] mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>At least</p>
      <div className="flex flex-wrap gap-2">
        {RULES.map((r) => {
          const ok = r.test(value);
          return (
            <span
              key={r.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                background: ok ? "#D1FAE5" : "transparent",
                color: ok ? "#065F46" : "#6B7280",
                border: ok ? "1px solid #6EE7B7" : "1px dashed #CBD5E1",
              }}
            >
              {ok && <Check size={11} />}
              {r.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0F172A] via-[#134E4A] to-[#0F766E] text-white p-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#22B8C7]/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-[#22B8C7]/20 blur-3xl" />

      <div className="relative">
        <Logo size={36} variant="light" />
      </div>

      <div className="relative z-10">
        <h2 className="mb-4" style={{ fontSize: "32px", fontWeight: 700, lineHeight: 1.2 }}>
          Draft legal documents with confidence.
        </h2>
        <p className="text-white/80 mb-10" style={{ fontSize: "14px", lineHeight: 1.7 }}>
          Professional templates, smart AI assistance, and Nigerian-court-ready formatting — all in one workspace.
        </p>

        <div className="flex flex-col gap-4">
          {[
            { icon: <FileText size={16} />, text: "20+ legal document templates ready to use" },
            { icon: <Sparkles size={16} />, text: "Context-aware AI suggestions as you write" },
            { icon: <ShieldCheck size={16} />, text: "Compliant formatting for Nigerian courts" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center text-[#22B8C7]">
                {f.icon}
              </div>
              <span style={{ fontSize: "13px" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-white/60" style={{ fontSize: "12px" }}>
        © {new Date().getFullYear()} Quillon &middot; Built for legal professionals
      </p>
    </div>
  );
}

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] grid lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex justify-center mb-6">
            <Logo size={32} />
          </div>
          <h1 className="text-[#0F172A] mb-1" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>{title}</h1>
          <p className="text-[#6B7280] mb-7" style={{ fontSize: "14px" }}>{subtitle}</p>
          {children}
          <p className="text-center mt-6 text-[#6B7280]" style={{ fontSize: "13px" }}>{footer}</p>
        </div>
      </div>
    </div>
  );
}

function FieldWrap({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">{icon}</span>
      {children}
    </div>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your workspace."
      footer={<>Don't have an account? <Link to="/signup" className="text-[#22B8C7]" style={{ fontWeight: 600 }}>Create one</Link></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldWrap icon={<Mail size={16} />}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputCls} style={inputStyle} />
        </FieldWrap>
        <FieldWrap icon={<Lock size={16} />}>
          <input type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} style={inputStyle} />
          <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A]">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </FieldWrap>
        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-[#22B8C7]" style={{ fontSize: "12px", fontWeight: 500 }}>Forgot password?</Link>
        </div>
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-lg px-3 py-2" style={{ fontSize: "12px" }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#22B8C7] hover:bg-[#1FA3B0] disabled:opacity-60 text-white rounded-xl py-3 transition mt-1 shadow-sm"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allRulesPass = useMemo(() => RULES.every((r) => r.test(password)), [password]);
  const passwordsMatch = confirm.length > 0 && password === confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allRulesPass) {
      setError("Please meet all password requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signup(fullName.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start drafting professional legal documents."
      footer={<>Already have an account? <Link to="/login" className="text-[#22B8C7]" style={{ fontWeight: 600 }}>Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldWrap icon={<UserIcon size={16} />}>
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" className={inputCls} style={inputStyle} />
        </FieldWrap>
        <FieldWrap icon={<Mail size={16} />}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputCls} style={inputStyle} />
        </FieldWrap>
        <div>
          <FieldWrap icon={<Lock size={16} />}>
            <input type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputCls} style={inputStyle} />
            <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A]">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </FieldWrap>
          <PasswordRules value={password} />
        </div>
        <div>
          <FieldWrap icon={<Lock size={16} />}>
            <input
              type={showConfirm ? "text" : "password"}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className={inputCls}
              style={{
                ...inputStyle,
                borderColor: confirm.length === 0 ? "#E2E4E8" : passwordsMatch ? "#6EE7B7" : "#FCA5A5",
              }}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A]">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </FieldWrap>
          {confirm.length > 0 && (
            <p className="mt-1.5 flex items-center gap-1" style={{ fontSize: "11px", color: passwordsMatch ? "#065F46" : "#B91C1C" }}>
              {passwordsMatch ? <><Check size={11} /> Passwords match</> : "Passwords don't match"}
            </p>
          )}
        </div>
        {error && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-lg px-3 py-2" style={{ fontSize: "12px" }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !allRulesPass || !passwordsMatch}
          className="bg-[#22B8C7] hover:bg-[#1FA3B0] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-3 transition mt-1 shadow-sm"
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
        <p className="text-center text-[#6B7280]" style={{ fontSize: "11px" }}>
          By continuing, you agree to Quillon's <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>Terms & Conditions</span> and <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>Privacy Policy</span>.
        </p>
      </form>
    </AuthShell>
  );
}

import { useState, FormEvent, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Check, ArrowLeft, ShieldCheck, MailCheck } from "lucide-react";
import { useAuth } from "./auth";
import { Logo } from "./Logo";
import { supabase } from "../../utils/supabase/client";

const inputCls = "w-full py-3 rounded-xl border border-[#E2E4E8] bg-white text-[#0F172A] focus:outline-none focus:border-[#22B8C7] focus:ring-2 focus:ring-[#22B8C7]/20 transition";
const inputStyle = { fontSize: "13px", paddingLeft: "44px", paddingRight: "44px" };

const RULES = [
  { label: "8 Characters", test: (s: string) => s.length >= 8 },
  { label: "Uppercase Letter", test: (s: string) => /[A-Z]/.test(s) },
  { label: "Special Character", test: (s: string) => /[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]/.test(s) },
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

function FieldWrap({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]">{icon}</span>
      {children}
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-[#0F172A] via-[#134E4A] to-[#0F766E] text-white p-12 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#22B8C7]/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-[#22B8C7]/20 blur-3xl" />
      <div className="relative">
        <Logo size={36} variant="light" />
      </div>
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-[#22B8C7] mb-5">
          <ShieldCheck size={26} />
        </div>
        <h2 className="mb-3" style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.2 }}>
          Reset your password securely.
        </h2>
        <p className="text-white/80" style={{ fontSize: "14px", lineHeight: 1.7 }}>
          We'll email you a secure recovery link. Click it to set a new password and get straight back to drafting.
        </p>
      </div>
      <p className="relative text-white/60" style={{ fontSize: "12px" }}>
        Need help? Contact support@quillon.app
      </p>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] grid lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { sendResetLink } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendResetLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#0F172A] mb-6" style={{ fontSize: "13px" }}>
        <ArrowLeft size={14} /> Back to sign in
      </Link>
      {sent ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-5">
            <MailCheck size={28} className="text-[#065F46]" />
          </div>
          <h1 className="text-[#0F172A] mb-2" style={{ fontSize: "24px", fontWeight: 700 }}>Check your inbox</h1>
          <p className="text-[#6B7280] mb-6" style={{ fontSize: "14px", lineHeight: 1.6 }}>
            We sent a password reset link to <span className="text-[#0F172A]" style={{ fontWeight: 600 }}>{email}</span>. Click the link to set a new password. It expires in 1 hour.
          </p>
          <p className="text-[#9CA3AF] mb-6" style={{ fontSize: "12px" }}>
            Don't see it? Check your spam folder, or{" "}
            <button onClick={() => setSent(false)} className="text-[#22B8C7] bg-transparent border-none" style={{ fontWeight: 600 }}>
              try a different email
            </button>.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-[#0F172A] mb-1" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>Forgot password?</h1>
          <p className="text-[#6B7280] mb-7" style={{ fontSize: "14px" }}>Enter your email and we'll send you a secure link to reset your password.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FieldWrap icon={<Mail size={16} />}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputCls} style={inputStyle} />
            </FieldWrap>
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-lg px-3 py-2" style={{ fontSize: "12px" }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#22B8C7] hover:bg-[#1FA3B0] disabled:opacity-60 text-white rounded-xl py-3 transition mt-1 shadow-sm"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>
        </>
      )}
    </Shell>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const allRulesPass = useMemo(() => RULES.every((r) => r.test(password)), [password]);
  const passwordsMatch = confirm.length > 0 && password === confirm;

  useEffect(() => {
    let resolved = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && !resolved)) {
        resolved = true;
        setReady(true);
      }
    });
    // Fallback: if a session is already present (link processed before listener attached), accept it.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !resolved) {
        resolved = true;
        setReady(true);
      }
    });
    const timeout = setTimeout(() => {
      if (!resolved) setLinkInvalid(true);
    }, 2500);
    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allRulesPass) { setError("Please meet all password requirements."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      await supabase.auth.signOut();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      {done ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-[#065F46]" />
          </div>
          <h1 className="text-[#0F172A] mb-2" style={{ fontSize: "24px", fontWeight: 700 }}>Password updated</h1>
          <p className="text-[#6B7280] mb-7" style={{ fontSize: "14px" }}>You can now sign in with your new password.</p>
          <button onClick={() => navigate("/login", { replace: true })} className="bg-[#22B8C7] hover:bg-[#1FA3B0] text-white rounded-xl py-3 px-6 transition shadow-sm" style={{ fontSize: "14px", fontWeight: 600 }}>
            Continue to Sign In
          </button>
        </div>
      ) : linkInvalid ? (
        <>
          <h1 className="text-[#0F172A] mb-2" style={{ fontSize: "24px", fontWeight: 700 }}>Link expired or invalid</h1>
          <p className="text-[#6B7280] mb-6" style={{ fontSize: "14px", lineHeight: 1.6 }}>
            This password reset link is no longer valid. Please request a new one.
          </p>
          <button onClick={() => navigate("/forgot-password", { replace: true })} className="bg-[#22B8C7] hover:bg-[#1FA3B0] text-white rounded-xl py-3 px-6 transition shadow-sm" style={{ fontSize: "14px", fontWeight: 600 }}>
            Request New Link
          </button>
        </>
      ) : !ready ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#22B8C7] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <h1 className="text-[#0F172A] mb-1" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>Set new password</h1>
          <p className="text-[#6B7280] mb-7" style={{ fontSize: "14px" }}>Choose a strong password you haven't used before.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <FieldWrap icon={<Lock size={16} />}>
                <input type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className={inputCls} style={inputStyle} />
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
                  placeholder="Confirm new password"
                  className={inputCls}
                  style={{ ...inputStyle, borderColor: confirm.length === 0 ? "#E2E4E8" : passwordsMatch ? "#6EE7B7" : "#FCA5A5" }}
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
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-lg px-3 py-2" style={{ fontSize: "12px" }}>{error}</div>
            )}
            <button type="submit" disabled={loading || !allRulesPass || !passwordsMatch} className="bg-[#22B8C7] hover:bg-[#1FA3B0] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-3 transition mt-1 shadow-sm" style={{ fontSize: "14px", fontWeight: 600 }}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </>
      )}
    </Shell>
  );
}

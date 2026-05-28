import brandMark from "../../assets/quillion-brand-mark.svg";
import brandLockup from "../../assets/quillion-brand-lockup.svg";

interface LogoProps {
  size?: number;
  variant?: "default" | "light";
  showWordmark?: boolean;
  className?: string;
}

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  const width = Math.round(size * (455 / 430));

  return (
    <img
      src={brandMark}
      alt=""
      aria-hidden="true"
      width={width}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ width: `${width}px`, height: `${size}px` }}
    />
  );
}

export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <img
      src={brandLockup}
      alt="Quillion"
      className={`block h-auto w-full max-w-[160px] object-contain drop-shadow-[0_16px_32px_rgba(34,184,199,0.22)] ${className}`}
    />
  );
}

export function Logo({ size = 32, variant = "default", showWordmark = true, className = "" }: LogoProps) {
  const textColor = variant === "light" ? "#FFFFFF" : "#0F172A";
  const shadow = variant === "light" ? "drop-shadow(0 8px 18px rgba(34, 184, 199, 0.22))" : undefined;

  return (
    <div
      className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}
      aria-label="Quillion"
      title="Quillion"
    >
      <LogoMark size={size} className={variant === "light" ? "drop-shadow-lg" : ""} />
      {showWordmark && (
        <span
          className="truncate"
          style={{
            fontSize: `${size * 0.72}px`,
            fontWeight: 800,
            color: textColor,
            letterSpacing: "-0.035em",
            lineHeight: 1,
            filter: shadow,
          }}
        >
          Quillion
        </span>
      )}
    </div>
  );
}

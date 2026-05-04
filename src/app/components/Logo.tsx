interface LogoProps {
  size?: number;
  variant?: "default" | "light";
  showWordmark?: boolean;
  className?: string;
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#22B8C7" />
      {/* Q ring */}
      <circle cx="20" cy="19" r="9" stroke="white" strokeWidth="3" fill="none" />
      {/* Quill-tail stroke (the Q's tail extending out as a nib) */}
      <path
        d="M23 24 L33 34"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Nib accent */}
      <path
        d="M30 31 L34 35 L33.2 31.2 Z"
        fill="white"
      />
    </svg>
  );
}

export function Logo({ size = 32, variant = "default", showWordmark = true, className = "" }: LogoProps) {
  const textColor = variant === "light" ? "#FFFFFF" : "#0F172A";
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          style={{
            fontSize: `${size * 0.7}px`,
            fontWeight: 700,
            color: textColor,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Quillon
        </span>
      )}
    </div>
  );
}

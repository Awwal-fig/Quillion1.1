import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/auth";

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#22B8C7"/><circle cx="20" cy="19" r="9" stroke="#fff" stroke-width="3" fill="none"/><path d="M23 24 L33 34" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M30 31 L34 35 L33.2 31.2 Z" fill="#fff"/></svg>`;

function applyFavicon() {
  const href = `data:image/svg+xml;utf8,${encodeURIComponent(FAVICON_SVG)}`;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/svg+xml";
  link.href = href;
  if (document.title !== "Quillon") document.title = "Quillon";
}

function applyStoredTheme() {
  try {
    const raw = localStorage.getItem("lexdraft_preferences");
    const mode = raw ? (JSON.parse(raw).theme as "system" | "light" | "dark") : "system";
    const resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    document.documentElement.classList.toggle("dark", resolved === "dark");
  } catch {}
}

export default function App() {
  useEffect(() => {
    applyFavicon();
    applyStoredTheme();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", applyStoredTheme);
    return () => mq.removeEventListener("change", applyStoredTheme);
  }, []);
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

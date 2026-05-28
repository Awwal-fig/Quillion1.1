import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./components/auth";
import { Analytics } from "@vercel/analytics/react";
import brandMark from "../assets/quillion-brand-mark.svg";

function applyFavicon() {
  const href = brandMark;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/svg+xml";
  link.href = href;
  if (document.title !== "Quillion") document.title = "Quillion";
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
      <Analytics />
    </AuthProvider>
  );
}

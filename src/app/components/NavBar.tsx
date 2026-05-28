import { NavLink } from "react-router";

const leftLinks = [
  { label: "Dashboard", to: "/" },
  { label: "Templates", to: "/templates" },
  { label: "My document", to: "/documents" },
  { label: "Matters", to: "/matters" },
];

const rightLinks = [
  { label: "Analytics", to: "/analytics" },
  { label: "Help & Support", to: "/support" },
];

export function NavBar({ mobileNavOpen, onNavigate }: { mobileNavOpen: boolean; onNavigate: () => void }) {
  return (
    <nav className={`w-full bg-[#F8FAFC] border-b border-[#E5E7EB] ${mobileNavOpen ? "block" : "hidden md:block"}`}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-1.5 md:py-0 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-0">
        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-6">
          {leftLinks.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `py-2 md:py-3 cursor-pointer rounded-md px-2 md:px-0 text-sm ${isActive ? "text-[#0F172A]" : "text-[#6B7280] hover:text-[#374151]"}`
              }
              style={({ isActive }) => ({
                fontSize: "14px",
                fontWeight: isActive ? 700 : 400,
                textDecoration: "none",
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-6">
          {rightLinks.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `py-2 md:py-3 cursor-pointer rounded-md px-2 md:px-0 text-sm ${isActive ? "text-[#0F172A]" : "text-[#6B7280] hover:text-[#374151]"}`
              }
              style={({ isActive }) => ({
                fontSize: "14px",
                fontWeight: isActive ? 700 : 400,
                textDecoration: "none",
              })}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

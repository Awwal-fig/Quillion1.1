import { NavLink } from "react-router";

const leftLinks = [
  { label: "Dashboard", to: "/" },
  { label: "Templates", to: "/templates" },
  { label: "My document", to: "/documents" },
];

const rightLinks = [
  { label: "Analytics", to: "/analytics" },
  { label: "Help & Support", to: "/support" },
];

export function NavBar() {
  return (
    <nav className="w-full bg-[#F8FAFC] border-b border-[#E5E7EB]">
      <div className="max-w-[1440px] mx-auto px-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {leftLinks.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `py-3 cursor-pointer ${isActive ? "text-[#0F172A]" : "text-[#6B7280] hover:text-[#374151]"}`
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
        <div className="flex items-center gap-6">
          {rightLinks.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `py-3 cursor-pointer ${isActive ? "text-[#0F172A]" : "text-[#6B7280] hover:text-[#374151]"}`
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

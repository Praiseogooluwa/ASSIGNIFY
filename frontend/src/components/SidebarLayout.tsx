import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut, HelpCircle, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AssignifyLogo from "./AssignifyLogo";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getUserName(): string {
  try {
    const token = localStorage.getItem("ap_token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    const full = payload?.user_metadata?.full_name || payload?.full_name || payload?.email || "";
    return full.split(" ")[0];
  } catch { return ""; }
}

const SidebarLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = getUserName();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/assignments/new", icon: PlusCircle, label: "Create Assignment" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("ap_token");
    navigate("/login");
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <AssignifyLogo size="sm" variant="light" />
      </div>

      {/* Greeting */}
      {name && (
        <div className="px-5 pt-5 pb-2">
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium">Lecturer Portal</p>
          <p className="text-white/90 text-sm mt-1 font-medium">{getGreeting()}, <span className="text-emerald-400">{name}</span></p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-primary text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <a
          href="mailto:praiseogooluwa118@gmail.com"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all duration-150"
        >
          <HelpCircle className="h-4 w-4" />
          Help & Support
        </a>
        <button
          onClick={() => { handleLogout(); onNavigate?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0a1a14] text-white shrink-0 fixed top-0 left-0 h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#0a1a14] flex items-center justify-between px-4">
        <AssignifyLogo size="sm" variant="light" />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0a1a14] text-white flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;

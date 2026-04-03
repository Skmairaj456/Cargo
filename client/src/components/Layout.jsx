import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Book" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/driver", label: "Driver" },
];

const Layout = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const AnimatedMain = motion.main;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            QuickCargo
          </Link>
          <nav className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-indigo-500 text-white"
                      : "text-slate-300 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-300 md:block">
                  {user?.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-full bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <AnimatedMain
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8"
      >
        {children}
      </AnimatedMain>
    </div>
  );
};

export default Layout;

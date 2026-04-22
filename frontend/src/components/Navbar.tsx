import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sun, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setOpen(false); };
  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors ${isActive(to) ? "text-solar-500" : "text-gray-600 hover:text-gray-900"}`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-gray-900">
            <div className="w-8 h-8 bg-solar-500 rounded-lg flex items-center justify-center">
              <Sun className="w-5 h-5 text-white" />
            </div>
            Sol<span className="text-solar-500">Match</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLink("/calculator", "ROI Calculator")}
            {navLink("/installers", "Find Installers")}
            {user ? (
              <>
                <Link
                  to={user.role === "INSTALLER" ? "/installer-dashboard" : "/dashboard"}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <span className="text-sm text-gray-500">Hi, {user.firstName}</span>
                <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLink("/calculator", "ROI Calculator")}
          {navLink("/installers", "Find Installers")}
          {user ? (
            <>
              <Link to={user.role === "INSTALLER" ? "/installer-dashboard" : "/dashboard"} onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">Dashboard</Link>
              <button onClick={handleLogout} className="text-left text-sm font-medium text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-gray-600">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm w-fit">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, Home } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardLink = user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

  const navItemStyles = (path) => `
    relative flex items-center gap-1.5 font-bold transition-all duration-300 px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider
    ${location.pathname === path 
      ? "bg-indigo-50 text-indigo-600" 
      : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"}
  `;

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md py-1.5 shadow-sm border-b border-slate-200" 
          : "bg-white py-2.5 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center rounded-lg font-bold shadow-md shadow-indigo-100 group-hover:rotate-3 transition-all">
            <span className="text-lg">BT</span>
          </div>
          <div className="hidden sm:block">
            <h3 className="text-base font-black text-slate-800 leading-tight tracking-tight">
              Test Series Portal
            </h3>
            <span className="text-[9px] uppercase tracking-[0.2em] font-black text-indigo-500/80 block -mt-0.5">
              Test Series
            </span>
          </div>
        </Link>

        {/* Desktop Menu & Auth */}
        <div className="hidden md:flex items-center gap-1">
          <div className="flex items-center gap-1 mr-3">
            <Link to="/" className={navItemStyles("/")}>
              <Home size={14} /> Home
            </Link>
            
            {user && (
              <Link to={dashboardLink} className={navItemStyles(dashboardLink)}>
                <LayoutDashboard size={14} /> Dashboard
              </Link>
            )}
          </div>

          {!user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <Link
                to="/login"
                className="px-4 py-1.5 text-slate-600 hover:text-indigo-600 font-bold transition-all text-xs uppercase tracking-widest"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-slate-900 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:-translate-y-0.5 transition-all shadow-md active:scale-95"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2.5 px-2 py-1 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-lg font-bold text-xs shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight pr-1">
                  <p className="text-slate-800 font-bold text-xs">{user.name?.split(' ')[0]}</p>
                  <p className="text-indigo-500 font-black uppercase text-[8px] tracking-widest">
                    {user.role}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all group"
                title="Logout"
              >
                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-50 text-slate-600 active:scale-90 transition-all"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 transition-all duration-300 ease-in-out origin-top ${
          isOpen ? "scale-y-100 opacity-100 shadow-xl" : "scale-y-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-5 space-y-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm">
            <Home size={16} /> Home
          </Link>

          {user && (
            <Link to={dashboardLink} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-sm">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}

          {!user ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-center text-xs uppercase">
                Login
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="py-3 rounded-xl bg-indigo-600 text-white font-bold text-center text-xs uppercase shadow-lg shadow-indigo-100">
                Register
              </Link>
            </div>
          ) : (
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-2xl text-white">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-lg font-black text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-base">{user.name}</p>
                  <p className="text-white/70 text-[10px] font-bold capitalize tracking-widest">{user.role}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full py-3 rounded-xl bg-rose-50 text-rose-500 font-black text-xs uppercase tracking-widest transition-all"
              >
                Logout Account
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
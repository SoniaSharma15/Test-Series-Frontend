import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronRight,
  Home
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile menu on route change
  useEffect(() => setIsOpen(false), [location]);

  // ✅ VANISH LOGIC: If a student/user is logged in, hide the Navbar completely
  if (user) {
    return null;
  }

  return (
    <>
      {/* 1. Static Spacer: Prevents content from being hidden under the fixed navbar */}
      <div className="h-20 w-full" />

      {/* 2. Fixed Sapphire Navbar */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-white/90 backdrop-blur-xl border-b border-blue-100 z-[1000] shadow-sm">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          {/* BRAND IDENTITY (Left side) */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl font-black shadow-lg shadow-blue-200 group-hover:rotate-6 transition-all duration-500">
              <ShieldCheck size={22} />
            </div>
            <div className="leading-none">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">
                The Brilliant <span className="text-blue-600">Bihar</span>
              </h3>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Official Node</p>
            </div>
          </Link>

          {/* ACTION HUB (Right side) */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8">
              {/* Shifted Home Link here */}
              <Link 
                to="/" 
                className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                  location.pathname === "/" ? "text-blue-600" : "text-slate-500 hover:text-blue-600"
                }`}
              >
                <Home size={14} />
                <span>Home</span>
              </Link>

              <Link 
                to="/login" 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-all"
              >
                Login
              </Link>

              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                Register
              </Link>
            </div>

            {/* MOBILE TOGGLE */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 active:scale-90 transition-all"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY DRAWER */}
        <div className={`fixed inset-0 top-20 h-screen bg-white z-[999] md:hidden transition-all duration-500 ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}`}>
          <div className="p-8 flex flex-col h-[calc(100vh-80px)]">
            <div className="space-y-6 pt-10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6 text-center">Navigation Hub</p>
              
              <div className="space-y-4">
                <Link 
                  to="/" 
                  className="w-full py-5 px-8 flex items-center justify-between border border-slate-200 rounded-[2rem] font-black text-xs uppercase text-slate-600 tracking-widest block group hover:border-blue-600 hover:text-blue-600 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Home size={18} />
                    <span>Return Home</span>
                  </div>
                  <ChevronRight size={16} />
                </Link>

                <Link 
                  to="/login" 
                  className="w-full py-5 text-center border border-slate-200 rounded-[2rem] font-black text-xs uppercase text-slate-600 tracking-widest block"
                >
                  Account Login
                </Link>
                <Link 
                  to="/register" 
                  className="w-full py-5 text-center bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/20 block"
                >
                  Join Program
                </Link>
              </div>
            </div>
            
            <div className="mt-auto pb-10 text-center">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Secure Institutional Environment</p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
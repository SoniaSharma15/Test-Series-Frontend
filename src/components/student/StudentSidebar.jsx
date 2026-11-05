import { NavLink, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  BarChart2,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  User2
} from "lucide-react";
import logo from "../../assets/logo.png";

export default function StudentSidebar() {
  // Mobile users usually expect sidebar to be closed by default
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard " },
    { to: "/student/test-series", icon: BookOpen, label: "All Courses  " },
    { to: "/student/my-tests", icon: ClipboardList, label: "My Active Batches" },
    { to: "/student/results", icon: ClipboardList, label: "My Results" },
    { to: "/student/performance", icon: BarChart2, label: "Performance" },
    { to: "/student/recent-performance", icon: TrendingUp, label: "Recent Scores" },
    { to: "/student/purchase-history", icon: ShoppingBag, label: "Transaction History" },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-5 py-3 border-l-4 transition-all duration-200 group ${isActive
      ? "bg-[#f1f5f9] border-[#1e3a8a] text-[#1e3a8a]"
      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  // Helper to close sidebar on mobile after clicking a link
  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="
    md:hidden fixed top-2 left-4 z-50
    bg-[#3e6787] rounded-[10%] 
    text-white p-3  shadow-xl
    active:scale-95 transition-all duration-200
    hover:shadow-2xl hover:brightness-110
    focus:outline-none focus:ring-2 focus:ring-blue-400
  "
          aria-label="Open menu"
        >
          <Menu size={22} strokeWidth={2.3} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-slate-200 w-64 flex flex-col shadow-sm transform transition-transform duration-300 z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Official Header - Fixed height */}
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                <img
                  src={logo}
                  alt="Portal Logo"
                  className="w-[30px] h-[30px] object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#1e3a8a] leading-none tracking-tight">
                  TEST SERIES PORTAL
                </span>
                <span className="text-[14px] font-medium text-slate-500  tracking-tighter">
                  Student Portal
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 p-1">
              <X size={20} />
            </button>
          </div>
        </div>

        <hr className="border-slate-200 my-2 flex-shrink-0" />

        {/* Navigation Section - Scrollable */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] uppercase font-bold text-slate-400 px-6 mb-4 flex items-center gap-2">
            Main Menu
          </p>

          <div className="flex flex-col">
            {menuItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={linkClass}
                onClick={closeSidebar} // FIX: Auto closes sidebar
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="opacity-80" />
                  <span className="font-semibold text-[15px]">{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Official Footer Profile - Fixed height, Gap reduced */}
        <div className="bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <div className="p-4 flex flex-col my-10">
            <div className="flex items-center gap-2 mb-4 bg-white  rounded-lg border border-slate-100">
              <div className="h-9 w-9 rounded bg-[#3e6787] flex items-center justify-center text-white shadow-sm shrink-0 font-bold">
                {user?.name?.charAt(0) || "S"}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-slate-800 truncate leading-none mb-1">
                  {user?.name || "Candidate Name"}
                </p>
                <p className="text-[13px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          {/* Version Info */}
          <div className="bg-[#3e6787] py-1.5 px-4 text-center">
            <span className="text-[8px] text-white/70 font-medium uppercase tracking-[0.2em]">
              Version 1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
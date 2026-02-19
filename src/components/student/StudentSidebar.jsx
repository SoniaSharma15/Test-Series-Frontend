import { NavLink, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext"; // Ensure path is correct
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
  ShieldCheck
} from "lucide-react";

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { to: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/student/test-series", icon: BookOpen, label: "All Test Series" },
    { to: "/student/my-tests", icon: ClipboardList, label: "My Tests Series" },
    { to: "/student/performance", icon: BarChart2, label: "Performance" },
    { to: "/student/recent-performance", icon: BarChart2, label: "Recent Performance" },
    { to: "/student/results", icon: ShoppingBag, label: "Results" },
    { to: "/student/purchase-history", icon: ShoppingBag, label: "Purchase History" },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
    }`;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden fixed top-5 left-5 z-50 bg-blue-600 text-white p-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-blue-900/10 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-slate-100 text-slate-800 w-72 flex flex-col shadow-sm transform transition-all duration-500 ease-in-out z-40
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-black tracking-tighter text-slate-900 uppercase italic">
                The Brilliant<span className="text-blue-600"> Bihar</span>
              </span>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1"></p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-blue-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar pt-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black px-4 mb-6">
            Protocol Menu
          </p>
          
          {menuItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="font-bold text-[13px] uppercase tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* PROFILE & LOGOUT SECTION */}
        <div className="p-6 mt-auto border-t border-slate-50 space-y-4">
          {/* User Profile Card */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl group transition-all hover:border-blue-200">
            <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <User size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user?.name || "Student Node"}</p>
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest italic truncate">{user?.email || "verified_user"}</p>
            </div>
          </div>

          {/* Logout Action */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 group"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
}
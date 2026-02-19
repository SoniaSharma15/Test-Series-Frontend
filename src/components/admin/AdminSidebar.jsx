import { NavLink, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  PlusSquare,
  Users,
  ClipboardList,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  LogOut,
  UserCheck
} from "lucide-react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
    }`;

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink to={to} className={linkClass} onClick={() => setIsOpen(false)}>
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="font-bold text-[13px] tracking-tight">{label}</span>
      </div>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );

  return (
    <>
      {/* --- MOBILE OVERLAY & TOGGLE --- */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-white shadow-xl rounded-2xl text-blue-600 border border-slate-100 active:scale-95 transition-transform"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SIDEBAR CONTAINER --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Brand Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-100">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none tracking-tighter italic">
                The<span className="text-blue-600">Brilliant Bihar</span>
              </h2>
              <p className="text-[9px] uppercase tracking-[0.3em] text-slate-400 font-black mt-1">
                Governance Suite
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 px-6 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black px-4 mb-4">
              Overview
            </p>
            <div className="flex flex-col gap-1.5">
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black px-4 mb-4">
              Catalog
            </p>
            <div className="flex flex-col gap-1.5">
              <NavItem to="/admin/test-series" icon={BookOpen} label="Test Series" />
              <NavItem to="/admin/create-test" icon={PlusSquare} label="Create Test" />
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black px-4 mb-4">
              Community
            </p>
            <div className="flex flex-col gap-1.5">
              <NavItem to="/admin/users" icon={Users} label="User Directory" />
              <NavItem to="/admin/enrollments" icon={ClipboardList} label="Enrollments" />
            </div>
          </div>
        </nav>

        {/* --- BOTTOM SECTION: PROFILE & LOGOUT --- */}
        <div className="p-6 mt-auto border-t border-slate-50 space-y-4 bg-slate-50/50">
          {/* Identity Blade */}
          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm group transition-all hover:border-blue-300">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              <UserCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 truncate tracking-tight uppercase italic leading-none mb-1">
                {user?.name || "System Admin"}
              </p>
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest leading-none">
                Root Access
              </p>
            </div>
          </div>

          {/* Exit Terminal Action */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-95 group"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Terminate Session</span>
          </button>
        </div>

      </aside>
    </>
  );
}
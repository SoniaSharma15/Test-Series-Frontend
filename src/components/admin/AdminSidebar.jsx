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

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between px-5 py-3 border-l-4 transition-all group ${
      isActive
        ? "bg-slate-50 border-[#1e3a8a] text-[#1e3a8a]"
        : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink to={to} className={linkClass} onClick={() => setIsOpen(false)}>
      <div className="flex items-center gap-3">
        <Icon size={16} className="opacity-80" />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100" />
    </NavLink>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#1e3a8a] text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} />
          <div>
            <p className="text-[10px] font-bold uppercase">Brilliant Bihar</p>
            <p className="text-[8px] opacity-70 uppercase">Admin Console</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-white/10 rounded-lg"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 w-64 
          h-[100dvh] bg-white border-r border-slate-200
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          pt-[60px] lg:pt-0
          flex flex-col
        `}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#1e3a8a] p-2 rounded text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1e3a8a] uppercase">
                Brilliant Bihar
              </p>
              <p className="text-[10px] text-slate-400 uppercase">
                Admin Panel
              </p>
            </div>
          </div>

          <button onClick={() => setIsOpen(false)} className="lg:hidden">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            <div>
              <p className="section-title">System Overview</p>
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Admin Dashboard" />
            </div>

            <div>
              <p className="section-title">Examination Management</p>
              <NavItem to="/admin/test-series" icon={BookOpen} label="Test Series Repo" />
              <NavItem to="/admin/create-test" icon={PlusSquare} label="Create New Module" />
            </div>

            <div>
              <p className="section-title">User Governance</p>
              <NavItem to="/admin/users" icon={Users} label="User Directory" />
              <NavItem to="/admin/enrollments" icon={ClipboardList} label="Master Enrollments" />
            </div>
          </div>
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t bg-slate-50">
          <div className="flex items-center gap-3 mb-3 bg-white p-2 rounded border">
            <div className="h-8 w-8 bg-[#1e3a8a] text-white flex items-center justify-center rounded">
              <UserCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-bold truncate">
                {user?.name || "Super Admin"}
              </p>
              <p className="text-[9px] text-blue-600 uppercase">
                Root Authority
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 border rounded font-bold text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={14} className="inline mr-2" />
            Terminate Session
          </button>

          <p className="text-[8px] text-center mt-3 text-slate-400 uppercase">
            System Version 1.0.4 • 2026
          </p>
        </div>
      </aside>
    </>
  );
}
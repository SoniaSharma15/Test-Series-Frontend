import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";

import {
  UserPlus,
  BookOpen,
  KeyRound,
  Users2,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

import CreateUserAssignCourse from "../../components/admin/CreateUserAssignCourse";
import ManualEnrollment from "../../components/admin/ManualEnrollment";
import CredentialReset from "../../components/admin/CredentialReset";
import AllUsersTable from "../../components/admin/AllUsersTable";

export default function Users() {
  const [seriesList, setSeriesList] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoadingSeries(true);
      const res = await axios.get("/test-series");
      setSeriesList(res.data);
    } catch (err) {
      console.error("Failed to fetch series:", err);
    } finally {
      setLoadingSeries(false);
    }
  };

  // Helper to get active tab details
  const getTabInfo = () => {
    switch(activeTab) {
      case 'create': return { title: "New Account Registration", icon: <UserPlus className="text-blue-500" size={20}/> };
      case 'enroll': return { title: "Course Access Control", icon: <BookOpen className="text-indigo-500" size={20}/> };
      case 'reset': return { title: "Security & Credentials", icon: <KeyRound className="text-purple-500" size={20}/> };
      default: return { title: "User Management", icon: <Users2 size={20}/> };
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">

          {/* ================= TOP NAVIGATION / HEADER ================= */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-200">
                <Users2 size={32} />
              </div>
              <div>
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Admin</span>
                  <ChevronRight size={12} />
                  <span className="text-blue-600">User Control</span>
                </nav>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  User <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Workspace</span>
                </h1>
              </div>
            </div>

            {/* Quick Stats or Status (Optional Enhancement) */}
            <div className="hidden lg:flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <LayoutDashboard size={20} />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">System Status</p>
                    <p className="text-sm font-bold text-slate-700">All Modules Active</p>
                </div>
            </div>
          </header>

          {/* ================= INTERACTIVE WORKSPACE ================= */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-20">

            {/* ===== LEFT SIDE – NAVIGATION TILES (4 cols) ===== */}
            <div className="xl:col-span-4 flex flex-col gap-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Actions</h2>
              
              {[
                { id: "create", icon: <UserPlus />, label: "Create User", desc: "Register new platform members" },
                { id: "enroll", icon: <BookOpen />, label: "Manual Enrollment", desc: "Assign specific test series" },
                { id: "reset", icon: <KeyRound />, label: "Credential Reset", desc: "Manage access & passwords" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-white border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100"
                      : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors duration-300 ${
                    activeTab === tab.id 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}>
                    {tab.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold transition-colors ${activeTab === tab.id ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"}`}>
                      {tab.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      {tab.desc}
                    </p>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* ===== RIGHT SIDE – DYNAMIC FORM AREA (8 cols) ===== */}
            <div className="xl:col-span-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 lg:p-10 min-h-[500px] relative overflow-hidden">
                    {/* Interior Header */}
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
                        <div className="p-2 rounded-lg bg-slate-50">
                            {getTabInfo().icon}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{getTabInfo().title}</h2>
                    </div>

                    <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === "create" && <CreateUserAssignCourse seriesList={seriesList} />}
                        {activeTab === "enroll" && (
                            <ManualEnrollment seriesList={seriesList} loadingSeries={loadingSeries} />
                        )}
                        {activeTab === "reset" && <CredentialReset />}
                    </div>

                    {/* Subtle Background Decoration */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 -z-0" />
                </div>
            </div>
          </div>

          {/* ================= DIRECTORY SECTION ================= */}
          <div className="relative">
            <div className="flex items-end justify-between mb-8 px-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-[2px] w-8 bg-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Database</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900">
                  User Directory
                </h2>
              </div>
            </div>

            <div className="rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
              <AllUsersTable />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
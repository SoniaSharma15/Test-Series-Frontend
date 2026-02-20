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

    {/* ✅ allow scrolling on mobile, prevent horizontal overflow */}
    <main className="flex-1 min-w-0 overflow-x-hidden">
      {/* ✅ responsive paddings */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10">

        {/* ================= TOP NAVIGATION / HEADER ================= */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 sm:mb-12">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <div className="p-3 sm:p-4 rounded-[1.75rem] sm:rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-200 shrink-0">
              <Users2 size={28} className="sm:hidden" />
              <Users2 size={32} className="hidden sm:block" />
            </div>

            <div className="min-w-0">
              <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                <span>Admin</span>
                <ChevronRight size={12} />
                <span className="text-blue-600">User Control</span>
              </nav>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                User{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Workspace
                </span>
              </h1>
            </div>
          </div>

          {/* keep same UI, just responsive visibility */}
          <div className="hidden lg:flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
                System Status
              </p>
              <p className="text-sm font-bold text-slate-700">All Modules Active</p>
            </div>
          </div>
        </header>

        {/* ================= INTERACTIVE WORKSPACE ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 mb-12 sm:mb-20">

          {/* ===== LEFT SIDE – NAVIGATION TILES ===== */}
          {/* ✅ mobile/tablet: allow nice layout; desktop same */}
          <div className="xl:col-span-4 flex flex-col gap-3 sm:gap-4">
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 sm:mb-2">
              Actions
            </h2>

            {/* ✅ on mobile make it 1 col, on md make 2 cols, on xl back to 1 col */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3 sm:gap-4">
              {[
                { id: "create", icon: <UserPlus />, label: "Create User", desc: "Register new platform members" },
                { id: "enroll", icon: <BookOpen />, label: "Manual Enrollment", desc: "Assign specific test series" },
                { id: "reset", icon: <KeyRound />, label: "Credential Reset", desc: "Manage access & passwords" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-300 text-left ${
                    activeTab === tab.id
                      ? "bg-white border-blue-200 shadow-xl shadow-blue-100/50 ring-1 ring-blue-100"
                      : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl transition-colors duration-300 shrink-0 ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}
                  >
                    {tab.icon}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`font-bold transition-colors truncate ${
                        activeTab === tab.id
                          ? "text-slate-900"
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
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
          </div>

          {/* ===== RIGHT SIDE – DYNAMIC FORM AREA ===== */}
          <div className="xl:col-span-8 min-w-0">
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm p-5 sm:p-8 lg:p-10 min-h-[420px] sm:min-h-[500px] relative overflow-hidden">
              {/* Interior Header */}
              <div className="flex items-center gap-3 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-50">
                <div className="p-2 rounded-lg bg-slate-50">
                  {getTabInfo().icon}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  {getTabInfo().title}
                </h2>
              </div>

              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === "create" && <CreateUserAssignCourse seriesList={seriesList} />}
                {activeTab === "enroll" && (
                  <ManualEnrollment seriesList={seriesList} loadingSeries={loadingSeries} />
                )}
                {activeTab === "reset" && <CredentialReset />}
              </div>

              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50 -z-0" />
            </div>
          </div>
        </div>

        {/* ================= DIRECTORY SECTION ================= */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8 px-1 sm:px-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-[2px] w-8 bg-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Database
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                User Directory
              </h2>
            </div>
          </div>

          {/* ✅ ensure table/card doesn't overflow on small screens */}
          <div className="rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
            <AllUsersTable />
          </div>
        </div>

      </div>
    </main>
  </div>
);
}
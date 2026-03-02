import { useEffect, useMemo, useState } from "react";
import axios from "../../services/axiosInstance";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/admin/AdminSidebar";
import PerformanceChart from "../../components/student/PerformanceChart";
import RevenueChart from "../../components/admin/RevenueChart";
import Loader from "../../components/common/Loader";
import {
  Users,
  Layers,
  BookOpen,
  IndianRupee,
  RefreshCcw,
  TrendingUp,
  ClipboardList,
  Calendar,
  ShieldCheck,
  Globe,
  ChevronRight,
  Home
} from "lucide-react";

function safeMoney(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

function safeDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/dashboard");
      setData(res?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Internal Server Sync Failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const graphData = useMemo(() => {
    const attempts = Array.isArray(data?.recentAttempts) ? data.recentAttempts : [];
    return attempts
      .map((a) => {
        const score = a?.score ?? a?.marks ?? a?.percent ?? a?.accuracy ?? null;
        const date = a?.submittedAt ?? a?.createdAt ?? a?.attemptedAt ?? a?.date ?? null;
        return { date, score: Number(score) };
      })
      .filter((x) => x.date && Number.isFinite(x.score))
      .reverse();
  }, [data]);

  const recentAttempts = Array.isArray(data?.recentAttempts) ? data.recentAttempts : [];

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        {/* 1. TOP UTILITY BAR (GOV STYLE) */}
        <div className="bg-[#1e3a8a] text-white px-6 py-2 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider sticky top-0 z-30">
          <span className="flex items-center gap-2"><Globe size={12}/> Governance Control Panel</span>
          <div className="flex gap-4">
            <span>Server Time: {new Date().toLocaleTimeString()}</span>
            <span className="text-emerald-400">● System Health: Optimal</span>
          </div>
        </div>

        {/* 2. HEADER & BREADCRUMBS */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-6">
          <div className="max-w-[1400px] mx-auto">
            <nav className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-widest mb-4">
              <Home size={12} />
              <ChevronRight size={10} />
              <span>Admin Console</span>
              <ChevronRight size={10} />
              <span className="text-[#1e3a8a]">Management Dashboard</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight">
                  System <span className="text-[#1e3a8a]">Overview Ledger</span>
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-tight">
                  Monitoring Students, Content Distribution, and Revenue Metrics.
                </p>
              </div>

              <button
                onClick={fetchDashboard}
                className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-900 transition-all shadow-md active:scale-95"
              >
                Sync Data <RefreshCcw size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-8">
          
          {/* 3. KPI GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <KpiCard title="Total Candidates" value={data?.totalStudents ?? 0} icon={<Users size={18} />} tone="blue" />
            <KpiCard title="Active Schemes" value={data?.totalTestSeries ?? 0} icon={<Layers size={18} />} tone="emerald" />
            <KpiCard title="Modules Published" value={data?.totalTests ?? 0} icon={<BookOpen size={18} />} tone="amber" />
            <KpiCard title="Gross Revenue" value={`₹${safeMoney(data?.totalRevenue ?? 0)}`} icon={<IndianRupee size={18} />} tone="slate" />
          </div>

          {/* 4. REVENUE TRENDS */}
          <section className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
                <IndianRupee size={16} className="text-[#1e3a8a]" />
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financial Growth Analytics</h3>
             </div>
             <div className="p-6">
               <RevenueChart revenue={data?.totalRevenue} dailyRevenue={data?.dailyRevenue} />
             </div>
          </section>

          {/* 5. DATA GRIDS */}
          <div className="grid grid-cols-12 gap-6 md:gap-8">
            {/* Performance chart */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2 tracking-widest">
                  <TrendingUp size={16} className="text-[#1e3a8a]" />
                  Examination Velocity Trend
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Records: {recentAttempts.length}</span>
              </div>
              <div className="p-6 h-[350px]">
                <PerformanceChart data={graphData} />
              </div>
            </div>

            {/* Recent attempts list (Styled as an Administrative List) */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2 tracking-widest">
                  <ClipboardList size={16} className="text-[#1e3a8a]" />
                  Latest Activity Logs
                </h3>
              </div>

              <div className="p-4 space-y-3">
                {recentAttempts.length === 0 ? (
                  <EmptyBox text="No activity logs found." />
                ) : (
                  recentAttempts.slice(0, 5).map((a) => {
                    const studentName = a?.studentId?.name || "Candidate";
                    const testName = a?.testId?.name || a?.testId?.title || "Test";
                    const when = safeDate(a?.submittedAt ?? a?.createdAt);
                    const score = typeof a?.obtainedMarks === "number" && a.totalMarks > 0
                                  ? (a.obtainedMarks / a.totalMarks) * 100 : "—";
                    return (
                      <div key={a?._id} className="p-4 bg-slate-50 border border-slate-200 rounded hover:bg-blue-50/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 uppercase truncate tracking-tight">{studentName}</p>
                            <p className="text-[10px] font-bold text-blue-700 uppercase mt-0.5">{testName}</p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-bold uppercase">
                               <Calendar size={12} /> {when}
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-slate-400 uppercase">Proficiency</p>
                             <p className="text-sm font-black text-slate-900">{Number.isFinite(Number(score)) ? `${Number(score).toFixed(1)}%` : score}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-[10px] font-bold text-[#1e3a8a] uppercase tracking-widest hover:underline">View All System Logs</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, icon, tone }) {
  const themes = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
      <div className={`${themes[tone]} w-10 h-10 rounded border flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.15em] mb-1">
        {title}
      </p>
      <h4 className="text-xl font-bold text-slate-800 tracking-tight">
        {value}
      </h4>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{text}</p>
    </div>
  );
}
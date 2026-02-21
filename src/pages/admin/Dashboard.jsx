import { useEffect, useMemo, useState } from "react";
import axios from "../../services/axiosInstance";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/admin/AdminSidebar";
import PerformanceChart from "../../components/student/PerformanceChart"; // reuse chart

import {
  Users,
  Layers,
  BookOpen,
  IndianRupee,
  RefreshCcw,
  TrendingUp,
  ClipboardList,
  Calendar,
} from "lucide-react";
import RevenueChart from "../../components/admin/RevenueChart";
import Loader from "../../components/common/Loader";

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
      // ✅ make sure this matches your route (example: /admin/dashboard)
      const res = await axios.get("/admin/dashboard");
      setData(res?.data || null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ✅ Build graph data from recentAttempts
  const graphData = useMemo(() => {
    const attempts = Array.isArray(data?.recentAttempts)
      ? data.recentAttempts
      : [];

    return attempts
      .map((a) => {
        // score key fallback (depends on your Attempt model)
        const score = a?.score ?? a?.marks ?? a?.percent ?? a?.accuracy ?? null;
        const date =
          a?.submittedAt ?? a?.createdAt ?? a?.attemptedAt ?? a?.date ?? null;

        return { date, score: Number(score) };
      })
      .filter((x) => x.date && Number.isFinite(x.score))
      .reverse();
  }, [data]);

  const recentAttempts = Array.isArray(data?.recentAttempts)
    ? data.recentAttempts
    : [];

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-5 md:p-8 space-y-8">
          {/* Header */}
          <section className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Admin <span className="text-blue-600">Dashboard</span>
              </h1>
              <p className="text-slate-500 font-semibold mt-1">
                Overview of students, content and revenue.
              </p>
            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              title="Refresh"
            >
              Refresh <RefreshCcw size={16} />
            </button>
          </section>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Students"
              value={data?.totalStudents ?? 0}
              icon={<Users size={18} />}
              tone="blue"
            />
            <KpiCard
              title="Test Series"
              value={data?.totalTestSeries ?? 0}
              icon={<Layers size={18} />}
              tone="emerald"
            />
            <KpiCard
              title="Total Tests"
              value={data?.totalTests ?? 0}
              icon={<BookOpen size={18} />}
              tone="amber"
            />
            <KpiCard
              title="Total Revenue"
              value={`₹${safeMoney(data?.totalRevenue ?? 0)}`}
              icon={<IndianRupee size={18} />}
              tone="slate"
            />
          </div>
          <RevenueChart
            revenue={data?.totalRevenue}
            dailyRevenue={data?.dailyRevenue}
          />
          {/* Main grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Performance chart */}


            <div className="col-span-12 lg:col-span-7 bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-600" />
                    Attempts Trend
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Trend created from latest attempts
                  </p>
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Attempts: {recentAttempts.length}
                </div>
              </div>

              <div className="h-[300px]">
                <PerformanceChart data={graphData} />
              </div>
            </div>

            {/* Recent attempts list */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ClipboardList size={16} className="text-blue-600" />
                  Recent Attempts
                </h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Latest 5
                </span>
              </div>

              {recentAttempts.length === 0 ? (
                <EmptyBox text="No attempts found." />
              ) : (
                <div className="space-y-3">
                  {recentAttempts.slice(0, 5).map((a) => {
                    const studentName = a?.studentId?.name || "Student";
                    const studentEmail = a?.studentId?.email || "—";
                    const testName =
                      a?.testId?.name || a?.testId?.title || "Test";
                    const when = safeDate(a?.submittedAt ?? a?.createdAt);

                    const score =
                      typeof a?.obtainedMarks === "number" &&
                        typeof a?.totalMarks === "number" &&
                        a.totalMarks > 0
                        ? (a.obtainedMarks / a.totalMarks) * 100
                        : "—";
                    return (
                      <div
                        key={a?._id || `${studentEmail}-${when}`}
                        className="rounded-2xl border border-slate-200 p-4 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">
                              {studentName}{" "}
                              <span className="text-slate-400">•</span>{" "}
                              <span className="text-slate-700">{testName}</span>
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
                              {studentEmail}
                            </p>
                            <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-2">
                              <Calendar size={14} className="text-slate-400" />
                              {when}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              Score
                            </p>
                            <p className="text-xl font-black text-slate-900">
  {Number.isFinite(Number(score))
    ? `${Number(score).toFixed(2)}%`
    : score}
</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>


          {/* Footer hint */}
          <div className="text-xs font-semibold text-slate-400">
            Showing last 5 attempts from backend.
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
      <p className="text-slate-500 font-black text-sm">{text}</p>
      <p className="text-slate-400 text-xs font-semibold mt-1">
        Activity will appear here.
      </p>
    </div>
  );
}

function KpiCard({ title, value, icon, tone }) {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200">
      <div
        className={`${themes[tone]} w-10 h-10 rounded-xl flex items-center justify-center mb-3 border`}
      >
        {icon}
      </div>
      <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none">
        {title}
      </p>
      <h4 className="text-xl font-black text-slate-900 mt-1 tracking-tight">
        {value}
      </h4>
    </div>
  );
}

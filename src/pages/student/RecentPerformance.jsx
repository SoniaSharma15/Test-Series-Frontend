import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import RecentPerformanceCard from "../../components/student/RecentPerformance";
import {
  ArrowLeft,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  ListChecks,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecentPerformance() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPerformance();
  }, []);

  const fetchRecentPerformance = async () => {
    try {
      const res = await axios.get("/attempts/recent-performance");
      setMetrics(res.data);
    } catch (err) {
      console.error("Failed to fetch recent performance", err.response);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <StudentSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 font-bold uppercase tracking-widest">
            No Recent Attempt Found
          </p>
        </div>
      </div>
    );
  }

  // ✅ FORMAT SCORE TO 2 DECIMAL
  const formattedScore = Number(metrics.score).toFixed(2);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-8">

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 mb-3"
              >
                <ArrowLeft size={14} /> Return
              </button>
              <h1 className="text-3xl font-black text-slate-900">
                Recent <span className="text-blue-600 italic">Metrics</span>
              </h1>
            </div>
          </header>

          {/* Batch + Test Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="text-blue-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Active Batch
                </p>
                <p className="font-black">{metrics.batchName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <ClipboardList className="text-indigo-600" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Test Name
                </p>
                <p className="font-black">{metrics.testName}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <PerformanceStat label="Score" value={`${formattedScore}%`} icon={<Target size={18} />} color="blue" />
            <PerformanceStat label="Time" value={`${metrics.timeSpent}m`} icon={<Zap size={18} />} color="amber" />
            <PerformanceStat label="Attempted" value={metrics.attempted} icon={<ListChecks size={18} />} color="indigo" />
            <PerformanceStat label="Correct" value={metrics.correct} icon={<CheckCircle size={18} />} color="emerald" />
            <PerformanceStat label="Wrong" value={metrics.wrong} icon={<XCircle size={18} />} color="rose" />
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-2xl border">
            <RecentPerformanceCard lastScore={Number(formattedScore)} />
          </div>

        </div>
      </main>
    </div>
  );
}

function PerformanceStat({ label, value, icon, color }) {
  const themes = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="bg-white border p-5 rounded-2xl shadow-sm">
      <div className={`${themes[color]} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

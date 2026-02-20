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
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Report</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <StudentSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm text-center">
            <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest">
              No Recent Attempt Found
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formattedScore = Number(metrics.score).toFixed(2);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-10">

          {/* Header Section */}
          <header className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Go Back
            </button>
            <div className="flex items-center gap-4">
              <div className="h-12 w-2 bg-blue-600 rounded-full" />
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Recent <span className="text-blue-600">Performance</span>
              </h1>
            </div>
          </header>

          {/* Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center gap-5 transition-all hover:shadow-md">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Batch</p>
                <p className="text-lg font-black text-slate-800 leading-none mt-1">{metrics.batchName}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center gap-5 transition-all hover:shadow-md">
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <ClipboardList className="text-indigo-600" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Test Name</p>
                <p className="text-lg font-black text-slate-800 leading-none mt-1">{metrics.testName}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <PerformanceStat label="Score" value={`${formattedScore}%`} icon={<Target size={20} />} color="blue" />
            <PerformanceStat label="Time" value={`${metrics.timeSpent}m`} icon={<Zap size={20} />} color="amber" />
            <PerformanceStat label="Attempted" value={metrics.attempted} icon={<ListChecks size={20} />} color="indigo" />
            <PerformanceStat label="Correct" value={metrics.correct} icon={<CheckCircle size={20} />} color="emerald" />
            <PerformanceStat label="Wrong" value={metrics.wrong} icon={<XCircle size={20} />} color="rose" />
          </div>

          {/* Chart Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Performance Trend</h3>
            </div>
            <RecentPerformanceCard lastScore={Number(formattedScore)} />
          </div>

        </div>
      </main>
    </div>
  );
}

function PerformanceStat({ label, value, icon, color }) {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100"
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-all group">
      <div className={`${themes[color]} w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border transition-transform group-hover:rotate-6`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
  );
}
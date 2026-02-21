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
import Loader from "../../components/common/Loader";

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

    if (res.data?.success && res.data?.data) {
      setMetrics(res.data.data);
    } else {
      setMetrics(null);
    }

  } catch (err) {
    console.error("Failed to fetch recent performance", err);
    setMetrics(null);
  } finally {
    setLoading(false);
  }
};

  /* =========================
     LOADING STATE
  ========================== */
  if (loading) {
    return <Loader />;
  }

  /* =========================
     EMPTY STATE
  ========================== */
  if (!metrics || Object.keys(metrics).length === 0) {
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

  /* =========================
     SAFE DESTRUCTURING
  ========================== */
  const {
    score = 0,
    timeSpent = 0,
    attempted = 0,
    correct = 0,
    wrong = 0,
    batchName = "N/A",
    testName = "N/A"
  } = metrics;

  /* =========================
     SAFE NUMERIC FORMAT
  ========================== */
  const safeScore = Number(score);
  const formattedScore = !isNaN(safeScore)
    ? safeScore.toFixed(2)
    : "0.00";

  const safeTime = Number(timeSpent) || 0;
  const safeAttempted = Number(attempted) || 0;
  const safeCorrect = Number(correct) || 0;
  const safeWrong = Number(wrong) || 0;

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
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
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
            <InfoCard
              icon={<BookOpen className="text-blue-600" size={24} />}
              label="Active Batch"
              value={batchName}
              bg="bg-blue-50"
            />

            <InfoCard
              icon={<ClipboardList className="text-indigo-600" size={24} />}
              label="Test Name"
              value={testName}
              bg="bg-indigo-50"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <PerformanceStat
              label="Score"
              value={`${formattedScore}%`}
              icon={<Target size={20} />}
              color="blue"
            />
            <PerformanceStat
              label="Time"
              value={`${safeTime}m`}
              icon={<Zap size={20} />}
              color="amber"
            />
            <PerformanceStat
              label="Attempted"
              value={safeAttempted}
              icon={<ListChecks size={20} />}
              color="indigo"
            />
            <PerformanceStat
              label="Correct"
              value={safeCorrect}
              icon={<CheckCircle size={20} />}
              color="emerald"
            />
            <PerformanceStat
              label="Wrong"
              value={safeWrong}
              icon={<XCircle size={20} />}
              color="rose"
            />
          </div>

          {/* Chart Section */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-lg">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                Performance Trend
              </h3>
            </div>

            <RecentPerformanceCard
              lastScore={Number(formattedScore)}
            />
          </div>

        </div>
      </main>
    </div>
  );
}

/* ========================================
   Reusable Info Card
======================================== */
function InfoCard({ icon, label, value, bg }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center gap-5 transition-all hover:shadow-md">
      <div className={`${bg} p-4 rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          {label}
        </p>
        <p className="text-lg font-black text-slate-800 leading-none mt-1">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

/* ========================================
   Performance Stat Card
======================================== */
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
      <div
        className={`${themes[color]} w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border transition-transform group-hover:rotate-6`}
      >
        {icon}
      </div>

      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>

      <p className="text-3xl font-black text-slate-900 tracking-tighter">
        {value ?? 0}
      </p>
    </div>
  );
}
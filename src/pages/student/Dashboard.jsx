import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { AuthContext } from "../../context/AuthContext";
import {
  Layout,
  Activity,
  Zap,
  ArrowUpRight,
  User,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Target
} from "lucide-react";

import StudentSidebar from "../../components/student/StudentSidebar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/student/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-[1300px] mx-auto p-5 md:p-10 space-y-8 animate-in fade-in duration-700">

          {/* TOP CONSOLE HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-200 shrink-0 font-black text-2xl">
                {user?.name?.charAt(0) || <User size={28} />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Secure Student Terminal</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Welcome, {user?.name?.split(" ")[0]} <Sparkles size={24} className="inline text-blue-500 fill-blue-500/10" />
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {data?.studentId?.substring(0, 8)}</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate("/student/my-tests")}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl shadow-slate-200"
            >
              Resume Learning <ArrowUpRight size={16} />
            </button>
          </header>

          {/* METRICS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricBox label="Active Batches" value={data?.enrolledSeries?.length || 0} icon={<Layout size={20}/>} />
            <MetricBox label="Tests Attempted" value={data?.testsTakenCount || 0} icon={<Zap size={20}/>} />
            <MetricBox label="System Accuracy" value={`${Number(data?.avgAccuracy || 0).toFixed(1)}%`} icon={<Activity size={20}/>} />
          </div>

          {/* BATCH SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Enrolled Curriculum</h3>
               <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-4">
{data?.enrolledSeries
  ?.filter((series) => {
    if (!series.expiryDate) return true;
    const today = new Date();
    const expiry = new Date(series.expiryDate);
    return expiry >= today;
  })
  .map((series) => (
                <BladeCard
                  key={series._id}
                  series={series}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/* ================= HELPERS ================= */

function getRemainingDays(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

/* ================= COMPONENTS ================= */

function MetricBox({ label, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center justify-between group hover:border-blue-500 transition-all duration-500">
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</h4>
      </div>
      <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
    </div>
  );
}

function BladeCard({ series, navigate }) {
  const remainingDays = getRemainingDays(series.expiryDate);
  const isExpired = remainingDays === 0 && series.expiryDate;

  return (
    <div
      onClick={() =>
        !isExpired &&
        navigate(`/student/my-tests?series=${series._id}`)
      }
      className={`bg-white p-6 px-10 rounded-[2rem] border transition-all cursor-pointer group shadow-sm flex flex-col lg:flex-row gap-8 items-center
        ${
          isExpired
            ? "border-red-200 opacity-60 cursor-not-allowed"
            : "border-slate-200 hover:border-blue-600"
        }`}
    >
      {/* Identity */}
      <div className="flex-1 w-full">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-blue-600" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Authenticated Asset
          </span>
        </div>

        <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
          {series.title}
        </h4>
      </div>

      {/* Progress */}
      <div className="w-full lg:w-56">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-bold uppercase text-slate-500 tracking-wide">
            Mastery
          </span>
          <span className="text-base font-black italic text-blue-600">
            {series.progress || 0}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
            style={{ width: `${series.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Expiry & Count */}
      <div className="flex gap-10 shrink-0 bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tests
          </p>
          <p className="text-lg font-black text-slate-800">
            {series.totalTests || 0}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Status
          </p>
          <p
            className={`text-lg font-black ${
              isExpired ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {isExpired ? "Expired" : "Active"}
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Expiry
          </p>
          <p
            className={`text-lg font-black ${
              remainingDays < 5
                ? "text-red-500"
                : "text-emerald-600"
            }`}
          >
            {series.expiryDate
              ? remainingDays > 0
                ? `${remainingDays} Days`
                : "Expired"
              : "Life"}
          </p>
        </div>
      </div>

      <ChevronRight
        className="hidden lg:block text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
        size={26}
      />
    </div>
  );
}


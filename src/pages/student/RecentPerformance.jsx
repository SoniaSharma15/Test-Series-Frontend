import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import RecentPerformanceCard from "../../components/student/RecentPerformance";
import {
  ArrowLeft, Target, Zap, CheckCircle, XCircle,
  ListChecks, BookOpen, ClipboardList, Home, 
  ChevronRight, Printer, Download, UserCheck
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

  if (loading) return <Loader />;

  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="flex min-h-screen bg-[#F1F5F9]">
        <StudentSidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-12 rounded border border-slate-200 shadow-sm text-center max-w-md w-full">
            <ClipboardList className="mx-auto text-slate-200 mb-6" size={64} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
              No Official Attempt Records Found
            </p>
            <button 
              onClick={() => navigate("/student/my-tests")}
              className="mt-6 bg-[#1e3a8a] text-white px-6 py-2 rounded text-xs font-bold uppercase"
            >
              Go to Examination Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    score = 0, timeSpent = 0, attempted = 0,
    correct = 0, wrong = 0, batchName = "N/A", testName = "N/A"
  } = metrics;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
        {/* 1. TOP UTILITY BAR (VERY GOV STYLE) */}
<div className="sticky top-0 z-5 bg-[#355872] text-white px-6 py-6 flex justify-between items-center text-[11px] font-medium">
  <div className="flex gap-4">
    <span className="hover:underline cursor-pointer"></span>
    <span className="hover:underline cursor-pointer"></span>
  </div>
  <div className="flex gap-4 items-center">
    <span>
      Standard Time: {new Date().toLocaleTimeString()}
    </span>
 
  </div>
</div>
        {/* BREADCRUMBS & HEADER */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-5">
         
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
              Candidate <span className="text-[#1e3a8a]">Scorecard Report</span>
            </h1>
           
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto p-6 lg:p-10 space-y-6">

          {/* CANDIDATE & BATCH INFO SECTION (REPORT HEADER STYLE) */}
          <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
               <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                 <UserCheck size={16} className="text-[#1e3a8a]" /> Examination Metadata
               </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded text-[#1e3a8a]"><BookOpen size={20}/></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Scheme / Batch</p>
                  <p className="text-sm font-bold text-slate-800 uppercase leading-tight">{batchName}</p>
                </div>
              </div>
              <div className="p-6 flex items-center gap-4">
                <div className="bg-indigo-50 p-3 rounded text-indigo-700"><ClipboardList size={20}/></div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Examination Nomenclature</p>
                  <p className="text-sm font-bold text-slate-800 uppercase leading-tight">{testName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* OFFICIAL PERFORMANCE GRID (DENSE & STRUCTURED) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GovStat label="Marks Percentage" value={`${score.toFixed(2)}%`} icon={<Target size={18}/>} color="text-blue-700" bg="bg-blue-50" />
            <GovStat label="Time Consumed" value={`${timeSpent}m`} icon={<Zap size={18}/>} color="text-amber-700" bg="bg-amber-50" />
            <GovStat label="Total Attempted" value={attempted} icon={<ListChecks size={18}/>} color="text-slate-700" bg="bg-slate-50" />
            <GovStat label="Correct Responses" value={correct} icon={<CheckCircle size={18}/>} color="text-emerald-700" bg="bg-emerald-50" />
            <GovStat label="Wrong Responses" value={wrong} icon={<XCircle size={18}/>} color="text-rose-700" bg="bg-rose-50" />
          </div>

          {/* STATISTICAL GRAPH AREA */}
          <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <Zap size={16} className="text-blue-700 animate-pulse" /> Performance Analysis Graph
              </h3>
            </div>
            
            <div className="p-8">
              <RecentPerformanceCard lastScore={Number(score)} />
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200">
               <p className="text-[10px] text-slate-500 font-medium text-center uppercase tracking-widest italic">
                 Official Computer Generated Scorecard • No Signature Required
               </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/* OFFICIAL UI HELPERS */

function GovStat({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white border border-slate-200 rounded p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-[#1e3a8a] transition-colors group">
      <div className={`${bg} ${color} w-10 h-10 rounded-full flex items-center justify-center mb-3 border border-slate-100`}>
        {icon}
      </div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight mb-1">{label}</p>
      <p className={`text-xl font-bold ${color} tracking-tight`}>{value}</p>
    </div>
  );
}
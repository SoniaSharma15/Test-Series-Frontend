import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import StudentSidebar from "../../components/student/StudentSidebar";
import {
  TrendingUp,
  Award,
  Activity,
  ShieldCheck,
  Zap,
  BarChart3,
  Calendar,
  Globe
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await axios.get("/attempts/performance");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const chartData = {
    labels: data.recentResults.map((_, index) => `Attempt ${index + 1}`),
    datasets: [
      {
        label: "Score",
        data: data.recentResults.map((a) => a.score),
        backgroundColor: "#2563EB",
        hoverBackgroundColor: "#1D4ED8",
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        titleFont: { size: 12, weight: 'bold' },
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: "#F1F5F9" }
      },
    },
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-[1300px] mx-auto p-5 md:p-10 space-y-8 animate-in fade-in duration-700">

          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 italic">Analytical Node Active</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                Performance <span className="text-blue-600">Analytics</span>
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
               <ShieldCheck className="text-blue-600" size={20} />
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
                  <p className="text-sm font-black text-slate-900">Top 5%</p>
               </div>
            </div>
          </header>

          {/* KPI GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPITile title="Attempt Cycles" value={data.totalAttempts} icon={<Activity size={20} />} />
            <KPITile title="Average Accuracy" value={`${data.averageScore?.toFixed(1)}%`} icon={<TrendingUp size={20} />} />
            <KPITile title="Peak Proficiency" value={`${data.highestScore?.toFixed(1)}%`} icon={<Award size={20} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LATEST ATTEMPT BLADE */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/10 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                       <Zap size={16} className="text-blue-400" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Latest Session</h3>
                    </div>
                    
                    <div className="space-y-6">
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1">Batch Identifier</p>
                          <p className="text-sm font-bold truncate">{data.latestBatchName || "N/A"}</p>
                       </div>
                       <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-blue-400 mb-1">Examination Node</p>
                          <p className="text-sm font-bold truncate">{data.latestTestName || "N/A"}</p>
                       </div>
                    </div>
                  </div>
                  <BarChart3 size={150} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
               </div>

               <div className="bg-blue-600 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl shadow-blue-500/20">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Next Goal</p>
                    <h4 className="text-lg font-black italic">+5% Improvement</h4>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                     <TrendingUp size={20} />
                  </div>
               </div>
            </div>

            {/* CHART CONSOLE */}
            <section className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="flex items-center justify-between mb-8 px-2">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                       <BarChart3 size={20} />
                    </div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Growth Trajectory</h3>
                 </div>
                 <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[9px] font-black border border-emerald-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM SYNCED
                 </div>
              </div>
              
              <div className="w-full h-[320px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

function KPITile({ title, value, icon }) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 group hover:border-blue-600 transition-all duration-500 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
        <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">{value}</h4>
      </div>
      <div className="text-blue-600 bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center border border-blue-100 transition-transform group-hover:scale-110">
        {icon}
      </div>
    </div>
  );
}
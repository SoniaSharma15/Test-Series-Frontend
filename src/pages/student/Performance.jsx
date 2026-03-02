import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import {
  TrendingUp, Award, Activity, ShieldCheck,
  Zap, BarChart3, Home, FileText, ChevronRight,
  Download, Filter, Calendar,
  Clock
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, PointElement, LineElement);

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

  if (loading) return <Loader />;

  const chartData = {
    labels: data.recentResults.map((_, index) => `SL ${index + 1}`),
    datasets: [
      {
        label: "Marks Percentage",
        data: data.recentResults.map((a) => a.score),
        backgroundColor: "#1e3a8a",
        borderRadius: 2,
        barThickness: 24,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { font: { size: 10, weight: 'bold' } } },
      x: { ticks: { font: { size: 10, weight: 'bold' } } }
    },
    plugins: {
      legend: { display: false }
    }
  };

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
        <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-5">
         
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
              Detailed <span className="text-[#1e3a8a]">Performance Analytics</span>
            </h1>
        
          </div>
        </div>

        <div className="max-w-[1300px] mx-auto p-6 space-y-6">

          {/* KPI GRID (FLAT STYLE) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPITile title="Total Attempts" value={data.totalAttempts} icon={<FileText className="text-blue-700" />} />
            <KPITile title="Average Marks" value={`${data.averageScore?.toFixed(1)}%`} icon={<Activity className="text-emerald-700" />} />
            <KPITile title="Highest Marks" value={`${data.highestScore?.toFixed(1)}%`} icon={<Award className="text-orange-600" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LATEST STATUS TABLE */}
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                      <Zap size={14} className="text-blue-700" /> Latest Session Log
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <GovSessionItem label="Examination" value={data.latestTestName || "N/A"} />
                    <GovSessionItem label="Batch Info" value={data.latestBatchName || "N/A"} />
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Rank</span>
                       <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100">TOP 5% IN BATCH</span>
                    </div>
                  </div>
               </div>

               {/* PERFORMANCE TARGET */}
               <div className="bg-[#1e3a8a] p-6 rounded shadow-lg text-white">
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em] mb-2">Targeted Growth</p>
                  <h4 className="text-xl font-bold">Achieve 85% Accuracy</h4>
                  <p className="text-[10px] mt-2 text-blue-200">System recommends focusing on Reasoning & Quantitative Aptitude.</p>
               </div>
            </div>

            {/* CHART REPORT */}
            <section className="lg:col-span-8 bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-700" /> Statistical Overview
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                    <Clock size={12} /> Last 10 Attempts
                  </div>
               </div>
              
              <div className="p-8 w-full h-[350px]">
                <Bar data={chartData} options={chartOptions} />
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-200">
                <p className="text-[10px] text-slate-500 font-medium italic text-center leading-relaxed">
                  * This chart represents your chronological score distribution. Official results are subject to verification by the examination cell.
                </p>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

/* OFFICIAL UI HELPERS */

function KPITile({ title, value, icon }) {
  return (
    <div className="bg-white p-6 border border-slate-200 rounded shadow-sm flex items-center justify-between hover:border-blue-700 transition-colors">
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
      </div>
      <div className="bg-slate-50 w-12 h-12 rounded flex items-center justify-center border border-slate-100">
        {icon}
      </div>
    </div>
  );
}

function GovSessionItem({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate border-b border-slate-50 pb-1">{value}</p>
    </div>
  );
}
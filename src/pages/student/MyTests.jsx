import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { Link } from "react-router-dom";
import {
  BookOpen,
  PlayCircle,
  Trophy,
  Layers,
  ArrowRight,
  Info,
  ChevronRight,
  Home,
  FileCheck,
  Clock,
  ExternalLink
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";

export default function MyTests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTests();
  }, []);

  const fetchMyTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/enrollments/my");
      const enrollments = Array.isArray(res.data) 
        ? res.data 
        : res.data?.enrollments || res.data?.data || [];
      setData(enrollments);
    } catch (err) {
      setError("Unable to retrieve your examination records.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

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
         
          
          <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
             My Active <span className="text-[#1e3a8a]">Test Series</span>
          </h1>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded flex items-center gap-3 text-xs font-bold">
              <Info size={16} /> {error}
            </div>
          )}

          {data.length === 0 && !error && (
            <div className="bg-white p-16 rounded border border-slate-200 text-center shadow-sm">
              <Layers className="text-slate-300 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-800 uppercase">No Active Enrolments Found</h3>
              <p className="text-slate-500 text-sm mt-2 mb-6">Please visit the catalogue to enrol in a test series.</p>
              <Link to="/student/test-series" className="inline-flex items-center gap-2 bg-[#1e3a8a] text-white px-6 py-2.5 rounded font-bold text-xs uppercase tracking-widest hover:bg-blue-900 transition-colors">
                Browse Catalogue <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* TABLE-BASED SECTIONS (GOV STYLE) */}
          {data.map((seriesItem) => (
            <div key={seriesItem.testSeries._id} className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
              {/* Batch Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#1e3a8a] p-2 rounded text-white">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                      {seriesItem.testSeries.title}
                    </h2>
                    
                  </div>
                </div>
                <div className="bg-blue-50 text-[#1e3a8a] px-3 py-1 rounded border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                  {seriesItem.tests.length} MODULES ALLOCATED
                </div>
              </div>

              {/* Module Table */}
<div className="w-full">

  {/* DESKTOP TABLE */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-white text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
          <th className="px-6 py-4">Module Name</th>
          <th className="px-6 py-4">Best Performance</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4 text-right">Action</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-50">
        {seriesItem.tests.map((testItem, index) => (
          <tr key={testItem.test._id} className="hover:bg-slate-50/50 transition-colors">

            <td className="px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-mono text-xs">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {testItem.test.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Official Test Pattern 2026
                  </p>
                </div>
              </div>
            </td>

            <td className="px-6 py-5">
              <div className="flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-slate-700">
                  {testItem.bestScore ?? 0}% Marks
                </span>
              </div>
            </td>

            <td className="px-6 py-5">
              {testItem.alreadyAttempted ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  <FileCheck size={12} /> Attempted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                  <Clock size={12} /> Pending
                </span>
              )}
            </td>

            <td className="px-6 py-5 text-right">
              {testItem.alreadyAttempted ? (
                <button
                  disabled
                  className="text-slate-300 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed"
                >
                  Access Locked
                </button>
              ) : (
                <Link
                  to={`/student/attempt/${testItem.test._id}`}
                  className="inline-flex items-center gap-1 text-[#1e3a8a] hover:text-blue-900 text-[10px] font-black uppercase tracking-widest"
                >
                  Start Test <ExternalLink size={12} />
                </Link>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* MOBILE CARD VIEW */}
  <div className="md:hidden space-y-4">
    {seriesItem.tests.map((testItem, index) => (
      <div
        key={testItem.test._id}
        className="bg-white border rounded-xl p-4 shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs text-slate-400 font-mono">
              Module {String(index + 1).padStart(2, '0')}
            </p>
            <p className="font-bold text-slate-800 text-sm">
              {testItem.test.name}
            </p>
          </div>

          {testItem.alreadyAttempted ? (
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              Attempted
            </span>
          ) : (
            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Pending
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs mb-3">
          <Trophy size={14} className="text-amber-500" />
          <span className="font-bold text-slate-700">
            Best: {testItem.bestScore ?? 0}%
          </span>
        </div>

        {testItem.alreadyAttempted ? (
          <button
            disabled
            className="w-full py-2 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-bold uppercase"
          >
            Access Locked
          </button>
        ) : (
          <Link
            to={`/student/attempt/${testItem.test._id}`}
            className="block w-full text-center py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest"
          >
            Start Module
          </Link>
        )}
      </div>
    ))}
  </div>

</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
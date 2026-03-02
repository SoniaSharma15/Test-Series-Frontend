import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Target,
  FileText,
  Calendar,
  Home,
  ExternalLink,
  ShieldCheck,
  Search
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";

export default function ResultsPage() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/results/my-results");
      setAttempts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching results:", err);
      setAttempts([]);
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

        {/* 2. HEADER & BREADCRUMBS */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-6">
          <div className="max-w-[1200px] mx-auto">
           

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight">
                  Examination <span className="text-[#1e3a8a]">Results Ledger</span>
                </h1>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  Official chronological record of all examination attempts and proficiency metrics.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded flex items-center gap-4 shadow-sm">
                <div className="bg-amber-100 p-2 rounded text-amber-700">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total Attempts</p>
                  <p className="text-sm font-bold text-slate-700">{attempts.length} Official Logs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RESPONSIVE RESULTS ================= */}
<div>

  {/* ===== DESKTOP TABLE ===== */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="bg-white text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
          <th className="px-6 py-4">S.No.</th>
          <th className="px-6 py-4">Examination Nomenclature</th>
          <th className="px-6 py-4">Submission Date</th>
          <th className="px-6 py-4 text-center">Score Breakdown</th>
          <th className="px-6 py-4 text-center">Accuracy</th>
          <th className="px-6 py-4 text-center">Final Score</th>
          <th className="px-6 py-4 text-right">View Log</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-50">
        {attempts.length > 0 ? (
          attempts.map((attempt, index) => {
            const total = attempt.correctCount + attempt.wrongCount;
            const accuracy = total > 0
              ? ((attempt.correctCount / total) * 100).toFixed(0)
              : 0;

            return (
              <tr key={attempt._id} className="hover:bg-blue-50/50">

                <td className="px-6 py-5 text-xs font-mono text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-800 uppercase">
                    {attempt.testId?.name}
                  </p>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-1">
                    {attempt.testId?.testSeriesId?.title || "Educational Series"}
                  </span>
                </td>

                <td className="px-6 py-5 text-xs text-slate-600">
                  {attempt.submittedAt
                    ? new Date(attempt.submittedAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-center gap-4 text-xs">
                    <div>
                      <p className="text-emerald-600 font-bold text-[9px] uppercase">Correct</p>
                      <p className="font-bold">{attempt.correctCount}</p>
                    </div>
                    <div>
                      <p className="text-red-600 font-bold text-[9px] uppercase">Wrong</p>
                      <p className="font-bold">{attempt.wrongCount}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5 text-center">
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                    {accuracy}%
                  </span>
                </td>

                <td className="px-6 py-5 text-center font-black">
                  {attempt.score}
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => navigate(`/student/result/${attempt._id}`)}
                    className="text-[#1e3a8a] font-bold text-[10px] uppercase"
                  >
                    Details →
                  </button>
                </td>

              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="7" className="p-20 text-center text-slate-400 text-xs font-bold uppercase">
              No examination records found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>


  {/* ===== MOBILE CARDS ===== */}
  <div className="md:hidden space-y-4 p-4">
    {attempts.map((attempt, index) => {
      const total = attempt.correctCount + attempt.wrongCount;
      const accuracy = total > 0
        ? ((attempt.correctCount / total) * 100).toFixed(0)
        : 0;

      return (
        <div key={attempt._id} className="border rounded-xl p-4 shadow-sm bg-white">

          <p className="text-xs text-slate-400 font-mono">
            #{String(index + 1).padStart(2, "0")}
          </p>

          <p className="font-bold text-slate-800 uppercase text-sm">
            {attempt.testId?.name}
          </p>

          <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border inline-block mt-1">
            {attempt.testId?.testSeriesId?.title || "Educational Series"}
          </span>

          <p className="text-xs text-slate-600 mt-2">
            Date: {attempt.submittedAt
              ? new Date(attempt.submittedAt).toLocaleDateString("en-GB")
              : "N/A"}
          </p>

          <div className="flex justify-between mt-3 text-xs">
            <span className="text-emerald-600 font-bold">
              ✔ {attempt.correctCount}
            </span>
            <span className="text-red-600 font-bold">
              ✖ {attempt.wrongCount}
            </span>
            <span className="font-bold text-indigo-700">
              {accuracy}%
            </span>
          </div>

          <div className="flex justify-between items-center mt-3">
            <span className="text-lg font-black">{attempt.score}</span>
            <button
              onClick={() => navigate(`/student/result/${attempt._id}`)}
              className="bg-[#1e3a8a] text-white text-[10px] px-4 py-2 rounded-lg font-bold uppercase"
            >
              View Details
            </button>
          </div>

        </div>
      );
    })}
  </div>

</div>
      </main>
    </div>
  );
}
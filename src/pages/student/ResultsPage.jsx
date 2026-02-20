import { useEffect, useState } from "react";
import axios from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Target,
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
      setLoading(false);
      const res = await axios.get("/results/my-results");
      setAttempts(res.data);
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
  <Loader/>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto p-8 space-y-8">
          
          {/* HEADER SECTION */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                My Result
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                Track your progress & analysis
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
              <Trophy className="text-amber-500" size={20} />
              <span className="text-sm font-black text-slate-700">
                {attempts.length} Tests Attempted
              </span>
            </div>
          </header>

          {/* RESULTS LIST */}
          <div className="space-y-4">
            {attempts.length > 0 ? (
              attempts.map((attempt) => (
                <ResultCard key={attempt._id} attempt={attempt} navigate={navigate} />
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">No results found yet. Take a test to see your score!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= COMPONENT ================= */

function ResultCard({ attempt, navigate }) {
  // Accuracy calculation
  const total = attempt.correctCount + attempt.wrongCount;
  const accuracy = total > 0 ? ((attempt.correctCount / total) * 100).toFixed(0) : 0;

  return (
    <div className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-default">
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        
        {/* Left Side: Test Info */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
              {attempt.testId?.testSeriesId?.title || "Test Series"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {new Date(attempt.createdAt).toLocaleDateString('en-GB')}
            </span>
          </div>
          
          <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
            {attempt.testId?.name}
          </h3>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Correct</p>
                <p className="text-sm font-black text-slate-900">{attempt.correctCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <XCircle size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Wrong</p>
                <p className="text-sm font-black text-slate-900">{attempt.wrongCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Target size={14} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Accuracy</p>
                <p className="text-sm font-black text-slate-900">{accuracy}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Score & Action */}
        <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</p>
            <h4 className="text-3xl font-black text-blue-600">{attempt.score}</h4>
          </div>

          <button
            onClick={() => navigate(`/student/result/${attempt._id}`)}
            className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 group/btn"
          >
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}

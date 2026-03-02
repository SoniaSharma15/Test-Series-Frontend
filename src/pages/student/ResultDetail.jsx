import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import {
  ChevronLeft,
  Languages,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Clock,
  BarChart3,
  Award,
  AlertCircle,
  Home,
  ChevronRight,
  FileText,
  ShieldCheck,
  Printer
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";
import Loader from "../../components/common/Loader";

export default function ResultDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [language, setLanguage] = useState("english");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      const res = await axios.get(`/attempts/result/${attemptId}`);
      setData(res.data);
    } catch (err) {
      console.error("Result Fetch Error:", err);
    }
  };

  if (!data) return <Loader />;

  const percentage = data.totalMarks > 0 
    ? ((data.obtainedMarks / data.totalMarks) * 100).toFixed(1) 
    : 0;

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <StudentSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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

        {/* HEADER & NAVIGATION */}
        <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-5">
          <div className="max-w-[1100px] mx-auto">
           

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                    {data.testId?.name}
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Attempt Reference ID: {attemptId.substring(0, 12).toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
                className="bg-[#1e3a8a] text-white px-5 py-2 rounded font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm"
              >
                <Languages size={14} />
                {language === "english" ? "Switch to Hindi View" : "Switch to English View"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto p-6 md:p-10 space-y-8">
          
          {/* PERFORMANCE SUMMARY TABLE STYLE */}
          <section className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
               <h3 className="text-[11px] font-bold text-slate-800 uppercase flex items-center gap-2">
                 <ShieldCheck size={16} className="text-[#1e3a8a]" /> Proficiency Statement
               </h3>
               <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                 Marks Awarded: {data.obtainedMarks} / {data.totalMarks}
               </span>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100 bg-white">
              <SummaryTile label="Percentage Score" value={`${percentage}%`} color="text-blue-800" />
              <SummaryTile label="Correct Count" value={data.correctCount} color="text-emerald-700" />
              <SummaryTile label="Incorrect Count" value={data.wrongCount} color="text-red-700" />
              <SummaryTile label="Total Attempted" value={data.attemptedCount} color="text-slate-800" />
            </div>
          </section>

          {/* QUESTIONS LIST */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Official Response Review
              </h3>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>

            {data.answers.map((ans, index) => (
              <GovQuestionCard
                key={index}
                ans={ans}
                index={index}
                language={language}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* OFFICIAL UI HELPERS */

function SummaryTile({ label, value, color }) {
  return (
    <div className="p-6 text-center">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}

function GovQuestionCard({ ans, index, language }) {
  if (!ans?.questionData) return null;

  const question = ans.questionData;
  const selected = ans.selectedAnswers || [];
  const correct = ans.correctAnswersSnapshot || [];
  const getText = (obj) => obj?.[language] || obj?.english || "";
  const status = ans.isCorrect ? "CORRECT" : selected.length > 0 ? "INCORRECT" : "NOT ATTEMPTED";

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
      {/* Q Header */}
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-white w-7 h-7 flex items-center justify-center text-xs font-bold rounded">
            {index + 1}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded border ${
            status === 'CORRECT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
            status === 'INCORRECT' ? 'bg-red-50 text-red-700 border-red-100' : 
            'bg-slate-100 text-slate-500 border-slate-200'
          }`}>
            {status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-slate-400 uppercase">Points Awarded</p>
          <p className="text-xs font-bold text-slate-800">+{ans.marksAwarded}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {question.passageText && (
          <div className="p-4 bg-slate-50 border-l-4 border-slate-300 text-xs text-slate-600 leading-relaxed font-medium">
            {getText(question.passageText)}
          </div>
        )}

        <h4 className="text-sm md:text-base font-bold text-slate-800 leading-relaxed">
          {getText(question.questionText)}
        </h4>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {question.options?.map((opt) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = correct.includes(opt.id);

            return (
              <div 
                key={opt.id} 
                className={`relative p-4 rounded border flex items-start gap-3 transition-colors ${
                  isCorrect ? 'bg-emerald-50 border-emerald-500' : 
                  (isSelected && !isCorrect) ? 'bg-red-50 border-red-500' : 
                  'bg-white border-slate-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCorrect ? <CheckCircle2 size={16} className="text-emerald-600" /> : 
                   (isSelected && !isCorrect) ? <XCircle size={16} className="text-red-600" /> : 
                   <CircleDashed size={16} className="text-slate-300" />}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-bold ${isCorrect ? 'text-emerald-800' : 'text-slate-700'}`}>
                    <span className="opacity-40 mr-1">Option {opt.id}:</span> {getText(opt.text)}
                  </p>
                </div>
                {isSelected && (
                  <span className="absolute -top-2 right-2 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                    Your Response
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
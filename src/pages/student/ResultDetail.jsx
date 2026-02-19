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
  AlertCircle
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";

export default function ResultDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [language, setLanguage] = useState("english");

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await axios.get(`/attempts/result/${attemptId}`);
      setData(res.data);
    } catch (err) {
      console.error("Result Fetch Error:", err);
    }
  };

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Report...</p>
        </div>
      </div>
    );
  }

  const percentage = data.totalMarks > 0 
    ? ((data.obtainedMarks / data.totalMarks) * 100).toFixed(1) 
    : 0;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
          <div className="max-w-[1000px] mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
            >
              <div className="p-1 rounded-lg group-hover:bg-blue-50">
                <ChevronLeft size={20} />
              </div>
              Back to Dashboard
            </button>

            <button
              onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              <Languages size={14} />
              {language === "english" ? "View in Hindi" : "View in English"}
            </button>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto p-6 md:p-10 space-y-10">
          
          {/* SUMMARY HERO */}
          <section className="relative bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Performance Summary</span>
                  <h2 className="text-4xl font-black text-slate-900 mt-2 tracking-tight">
                    {data.testId?.name}
                  </h2>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Overall Grade</p>
                        <p className="text-3xl font-black text-blue-600">{percentage}%</p>
                    </div>
                    <div className="h-12 w-[2px] bg-slate-200" />
                    <Award className="text-blue-600" size={32} />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
                <SummaryBox label="Obtained Marks" value={`${data.obtainedMarks} / ${data.totalMarks}`} icon={<BarChart3 size={18} />} color="blue" />
                <SummaryBox label="Correct" value={data.correctCount} icon={<CheckCircle2 size={18} />} color="emerald" />
                <SummaryBox label="Incorrect" value={data.wrongCount} icon={<XCircle size={18} />} color="rose" />
                <SummaryBox label="Attempted" value={data.attemptedCount} icon={<Clock size={18} />} color="amber" />
              </div>
            </div>
            
            {/* Decorative watermark */}
            <div className="absolute top-[-10%] right-[-5%] text-slate-50 opacity-50 rotate-12">
               <BarChart3 size={250} />
            </div>
          </section>

          {/* QUESTIONS ANALYSIS */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                Detailed Analysis
              </h3>
              <div className="h-[1px] flex-1 bg-slate-200" />
            </div>

            {data.answers.map((ans, index) => (
              <QuestionCard
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

function SummaryBox({ label, value, icon, color }) {
  const themes = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className={`p-5 rounded-[2rem] border ${themes[color]} transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-3 opacity-80">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function QuestionCard({ ans, index, language }) {
  if (!ans?.questionData) return null;

  const question = ans.questionData;
  const selected = ans.selectedAnswers || [];
  const correct = ans.correctAnswersSnapshot || [];

  const getText = (obj) => obj?.[language] || obj?.english || "";

  const status = ans.isCorrect ? "correct" : selected.length > 0 ? "wrong" : "skipped";

  const statusThemes = {
    correct: "border-emerald-200 bg-white",
    wrong: "border-rose-200 bg-white",
    skipped: "border-slate-200 bg-slate-50/50"
  };

  return (
    <div className={`group rounded-[2.5rem] border-2 ${statusThemes[status]} overflow-hidden transition-all hover:shadow-lg`}>
      <div className="p-8">
        {/* Q-HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 text-white text-sm font-black shadow-lg shadow-slate-200">
               {index + 1}
             </span>
             <div>
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Question Status</p>
                <p className={`text-xs font-bold uppercase tracking-widest ${status === 'correct' ? 'text-emerald-600' : status === 'wrong' ? 'text-rose-600' : 'text-slate-500'}`}>
                  {status}
                </p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Marks</p>
             <p className="text-sm font-black text-slate-700">+{ans.marksAwarded}</p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="space-y-6">
          {question.passageText && (
            <div className="p-6 bg-slate-50 rounded-3xl text-sm leading-relaxed text-slate-600 border border-slate-100 italic">
              {getText(question.passageText)}
            </div>
          )}

          <h4 className="text-xl font-bold text-slate-800 leading-snug">
            {getText(question.questionText)}
          </h4>

          {/* OPTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {question.options?.map((opt) => {
              const isSelected = selected.includes(opt.id);
              const isCorrect = correct.includes(opt.id);

              let style = "bg-white border-slate-200 text-slate-600 hover:border-slate-300";
              let icon = <CircleDashed size={16} className="text-slate-200" />;

              if (isCorrect) {
                style = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50";
                icon = <CheckCircle2 size={16} className="text-emerald-500" />;
              }
              if (isSelected && !isCorrect) {
                style = "bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50";
                icon = <XCircle size={16} className="text-rose-500" />;
              }

              return (
                <div key={opt.id} className={`relative flex items-start gap-4 p-5 rounded-3xl border-2 transition-all font-bold text-sm ${style}`}>
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black uppercase opacity-40 mr-2">Option {opt.id}</span>
                    <p>{getText(opt.text)}</p>
                  </div>
                  {isSelected && (
                    <span className="absolute -top-2 -right-2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">
                      Your Choice
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
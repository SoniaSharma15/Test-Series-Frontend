import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import { 
  ChevronLeft, 
  Languages, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Clock,
  BarChart3
} from "lucide-react";
import StudentSidebar from "../../components/student/StudentSidebar";

export default function ResultDetail() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [language, setLanguage] = useState("english");

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`/results/detail/${attemptId}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

  if (!data) return (
    <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200 px-8 py-4">
          <div className="max-w-[1000px] mx-auto flex justify-between items-center">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={20} /> Back
            </button>

            <button
              onClick={() => setLanguage(language === "english" ? "hindi" : "english")}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              <Languages size={16} /> {language === "english" ? "Hindi Mode" : "English Mode"}
            </button>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto p-8 space-y-8">
          {/* TITLE & OVERVIEW */}
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 mb-6">{data.test?.name}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryBox label="Total Score" value={data.score} color="text-blue-600" icon={<BarChart3 size={16}/>} />
              <SummaryBox label="Correct" value={data.correct} color="text-emerald-600" icon={<CheckCircle2 size={16}/>} />
              <SummaryBox label="Wrong" value={data.wrong} color="text-rose-600" icon={<XCircle size={16}/>} />
              <SummaryBox label="Attempted" value={data.attempted} color="text-slate-600" icon={<Clock size={16}/>} />
            </div>
          </section>

          {/* QUESTIONS ANALYSIS */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Question Wise Analysis</h3>
            
            {data.resultData.map((q, index) => (
              <QuestionCard key={index} q={q} index={index} lang={language} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function SummaryBox({ label, value, color, icon }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className={`flex items-center gap-2 ${color} mb-1`}>
        {icon}
        <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

function QuestionCard({ q, index, lang }) {
  if (!q) return null;

  const isMSQ = q.type === "MSQ";

  /* ================= SAFE TEXT GETTER ================= */
  const getText = (obj) => {
    if (!obj || typeof obj !== "object") return "";
    return obj?.[lang] || obj?.english || obj?.hindi || "";
  };

  /* ================= STATUS DETECTION ================= */
  const hasAttempt =
    isMSQ
      ? Array.isArray(q.selectedAnswers) && q.selectedAnswers.length > 0
      : q.selectedAnswer !== undefined && q.selectedAnswer !== null;

  const status = q.isCorrect
    ? "correct"
    : hasAttempt
    ? "wrong"
    : "unattempted";

  const statusStyles = {
    correct: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: <CheckCircle2 size={18} />,
    },
    wrong: {
      border: "border-rose-200",
      bg: "bg-rose-50",
      text: "text-rose-700",
      icon: <XCircle size={18} />,
    },
    unattempted: {
      border: "border-slate-200",
      bg: "bg-slate-50",
      text: "text-slate-500",
      icon: <MinusCircle size={18} />,
    },
  };

  const options = Array.isArray(q.options) ? q.options : [];

  return (
    <div
      className={`bg-white rounded-[2rem] border-2 ${statusStyles[status].border} overflow-hidden shadow-sm`}
    >
      <div className="p-6 md:p-8">

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black">
            Question {index + 1}
            {isMSQ && <span className="ml-2 text-amber-300">MSQ</span>}
          </span>

          <div
            className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest ${statusStyles[status].text}`}
          >
            {statusStyles[status].icon} {status}
          </div>
        </div>

        {/* QUESTION TEXT */}
        <h4 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">
          {getText(q.questionText) || "Question not available"}
        </h4>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((opt, i) => {
            const optionLabel = getText(opt);

            /* ================= INDEX BASED LOGIC ================= */
            const correctIndex = q.correctAnswer;
            const correctIndexes = q.correctAnswers || [];

            const selectedIndex = q.selectedAnswer;
            const selectedIndexes = q.selectedAnswers || [];

            let isCorrect = false;
            let isSelected = false;

            if (isMSQ) {
              isCorrect = Array.isArray(correctIndexes)
                ? correctIndexes.includes(i)
                : false;

              isSelected = Array.isArray(selectedIndexes)
                ? selectedIndexes.includes(i)
                : false;
            } else {
              isCorrect = correctIndex === i;
              isSelected = selectedIndex === i;
            }

            /* ================= TEXT FALLBACK SUPPORT ================= */
            // In case backend still sends text-based answers
            if (!isCorrect && !isSelected) {
              if (!isMSQ) {
                if (optionLabel === q.correctAnswer) isCorrect = true;
                if (optionLabel === q.selectedAnswer) isSelected = true;
              } else {
                if (
                  Array.isArray(q.correctAnswers) &&
                  q.correctAnswers.includes(optionLabel)
                )
                  isCorrect = true;

                if (
                  Array.isArray(q.selectedAnswers) &&
                  q.selectedAnswers.includes(optionLabel)
                )
                  isSelected = true;
              }
            }

            /* ================= COLOR LOGIC ================= */
            let bgColor =
              "bg-slate-50 border-slate-100 text-slate-600";

            if (isCorrect && isSelected)
              bgColor =
                "bg-emerald-500 border-emerald-500 text-white shadow-lg";

            else if (isCorrect)
              bgColor =
                "bg-emerald-200 border-emerald-200 text-emerald-800";

            else if (isSelected && !isCorrect)
              bgColor =
                "bg-rose-500 border-rose-500 text-white";

            return (
              <div
                key={i}
                className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {String.fromCharCode(65 + i)}. {optionLabel}
                  </span>

                  {isCorrect && isSelected && <CheckCircle2 size={16} />}
                  {isCorrect && !isSelected && <MinusCircle size={16} />}
                  {isSelected && !isCorrect && <XCircle size={16} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs font-semibold text-slate-500">
          {isMSQ ? (
            <>
              <div>
                Your Selection:{" "}
                {Array.isArray(q.selectedAnswers) &&
                q.selectedAnswers.length > 0
                  ? q.selectedAnswers.join(", ")
                  : "N/A"}
              </div>

              <div className="text-emerald-600">
                Correct:{" "}
                {Array.isArray(q.correctAnswers)
                  ? q.correctAnswers.join(", ")
                  : "N/A"}
              </div>
            </>
          ) : (
            <>
              <div>
                Your Pick:{" "}
                {q.selectedAnswer !== undefined
                  ? q.selectedAnswer
                  : "N/A"}
              </div>
              <div className="text-emerald-600">
                Correct: {q.correctAnswer}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

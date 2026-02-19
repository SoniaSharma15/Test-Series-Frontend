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
  BarChart3,
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
      const res = await axios.get(`/attempt/result/${attemptId}`);
      setData(res.data);
    } catch (err) {
      console.error("Result Fetch Error:", err);
    }
  };

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const percentage =
    data.totalMarks > 0
      ? ((data.obtainedMarks / data.totalMarks) * 100).toFixed(1)
      : 0;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <StudentSidebar />

      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md border-b px-8 py-4">
          <div className="max-w-[1000px] mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600"
            >
              <ChevronLeft size={20} /> Back
            </button>

            <button
              onClick={() =>
                setLanguage(language === "english" ? "hindi" : "english")
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Languages size={16} />
              {language === "english" ? "Hindi Mode" : "English Mode"}
            </button>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto p-8 space-y-8">
          {/* SUMMARY */}
          <section className="bg-white p-8 rounded-[2rem] border shadow-sm">
            <h2 className="text-3xl font-black mb-6">
              {data.testId?.name}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryBox
                label="Score"
                value={`${data.obtainedMarks} / ${data.totalMarks}`}
                icon={<BarChart3 size={16} />}
                color="text-blue-600"
              />
              <SummaryBox
                label="Correct"
                value={data.correctCount}
                icon={<CheckCircle2 size={16} />}
                color="text-emerald-600"
              />
              <SummaryBox
                label="Wrong"
                value={data.wrongCount}
                icon={<XCircle size={16} />}
                color="text-rose-600"
              />
              <SummaryBox
                label="Attempted"
                value={data.attemptedCount}
                icon={<Clock size={16} />}
                color="text-slate-600"
              />
            </div>

            <div className="mt-6 text-sm font-bold text-blue-600">
              Percentage: {percentage}%
            </div>
          </section>

          {/* QUESTIONS */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
              Question Wise Analysis
            </h3>

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

/* ================= SUMMARY BOX ================= */

function SummaryBox({ label, value, icon, color }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-[10px] font-black uppercase">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

/* ================= QUESTION CARD ================= */

function QuestionCard({ ans, index, language }) {
  if (!ans?.questionData) return null;

  const question = ans.questionData;
  const selected = ans.selectedAnswers || [];
  const correct = ans.correctAnswersSnapshot || [];

  const getText = (obj) => {
    if (!obj) return "";
    return obj?.[language] || obj?.english || "";
  };

  const status = ans.isCorrect
    ? "correct"
    : selected.length > 0
    ? "wrong"
    : "unattempted";

  const statusColor =
    status === "correct"
      ? "border-emerald-300"
      : status === "wrong"
      ? "border-rose-300"
      : "border-slate-200";

  return (
    <div className={`bg-white rounded-[2rem] border-2 ${statusColor} shadow-sm`}>
      <div className="p-8">
        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-black">
            Question {index + 1}
          </span>
          <span className="text-xs font-black uppercase">{status}</span>
        </div>

        {/* PASSAGE TEXT (if exists) */}
        {question.passageText && (
          <div className="mb-6 p-4 bg-slate-50 rounded-xl text-sm">
            {getText(question.passageText)}
          </div>
        )}

        {/* QUESTION TEXT */}
        <h4 className="text-lg font-bold mb-6">
          {getText(question.questionText)}
        </h4>

        {/* OPTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options?.map((opt, i) => {
            const isSelected = selected.includes(opt.id);
            const isCorrect = correct.includes(opt.id);

            let bg =
              "bg-slate-50 border-slate-100 text-slate-600";

            if (isCorrect && isSelected)
              bg = "bg-emerald-500 border-emerald-500 text-white";
            else if (isCorrect)
              bg = "bg-emerald-200 border-emerald-200 text-emerald-800";
            else if (isSelected)
              bg = "bg-rose-500 border-rose-500 text-white";

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-2xl border-2 font-bold text-sm ${bg}`}
              >
                {opt.id}. {getText(opt.text)}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-xs font-semibold text-slate-500">
          Marks Awarded: {ans.marksAwarded}
        </div>
      </div>
    </div>
  );
}

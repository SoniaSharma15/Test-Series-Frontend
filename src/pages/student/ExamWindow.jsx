import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import QuestionPanel from "../../components/student/QuestionPanel";

export default function ExamWindow() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [reviewQuestions, setReviewQuestions] = useState(new Set());
  
  // Mobile UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const submittingRef = useRef(false);
  const examEndRef = useRef(null);
  
  /* ================= INIT ================= */
  useEffect(() => {
    initExam();
    return cleanup;
  }, []);

  /* ================= FULLSCREEN + VIOLATION MONITOR ================= */
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log("Fullscreen blocked");
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submitted) {
        triggerViolation("You exited fullscreen mode.");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        triggerViolation("Tab switching detected.");
      }
    };

    const triggerViolation = (message) => {
      setViolations((prev) => {
        const newCount = prev + 1;

        if (newCount >= 3) {
          alert("Multiple violations detected. Exam will be submitted.");
          handleSubmit(true);
        } else {
          setShowWarning(true);
        }

        return newCount;
      });
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [submitted]);


  const initExam = async () => {
    try {
      const res = await axios.get(`/attempts/exam/${attemptId}`);

      if (!res.data?.questions?.length) {
        throw new Error("No questions found");
      }

      setTest(res.data.test);
      const randomizedQuestions = shuffleArray(res.data.questions);
      setQuestions(randomizedQuestions);

      const duration = res.data.duration || res.data.test?.duration;
      const startedAt = new Date(res.data.startedAt).getTime();
      const durationMs = duration * 60 * 1000;
      examEndRef.current = startedAt + durationMs;

      const remaining = Math.floor((examEndRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        await handleSubmit(true);
        return;
      }

      setTimeLeft(remaining);
      startTimer();
      startHeartbeat();

      setLoading(false);
    } catch (err) {
      console.error("Exam Init Error:", err);
      setError("Unable to load exam.");
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /* ================= TIMER ================= */
  const startTimer = () => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const remaining = Math.floor(
        (examEndRef.current - Date.now()) / 1000
      );

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft(0);
        handleSubmit(true);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
  };

  /* ================= HEARTBEAT ================= */
  const startHeartbeat = () => {
    heartbeatRef.current = setInterval(() => {
      axios.post("/attempts/heartbeat", { attemptId }).catch(() => { });
    }, 15000);
  };

  const cleanup = () => {
    clearInterval(timerRef.current);
    clearInterval(heartbeatRef.current);
  };

  /* ================= VISIT / REVIEW ================= */
  const markQuestionAsVisited = (index) => {
    const qId = questions[index]?._id;
    if (!qId) return;
    setVisitedQuestions((prev) => new Set([...Array.from(prev), qId]));
  };

  const toggleReviewForQuestion = (index) => {
    const qId = questions[index]?._id;
    if (!qId) return;
    setReviewQuestions((prev) => {
      const copy = new Set([...Array.from(prev)]);
      if (copy.has(qId)) copy.delete(qId);
      else copy.add(qId);
      return copy;
    });
  };

  const clearAnswerForQuestion = (index) => {
    const qId = questions[index]?._id;
    if (!qId) return;
    setAnswers((prev) => prev.filter((a) => a.questionId !== qId));
    markQuestionAsVisited(index);
  };

  /* ================= ANSWER SELECT ================= */
  const selectOption = (optionText, isMSQ) => {
  const qId = questions[current]?._id;
  if (!qId) return;
  
  markQuestionAsVisited(current);

  if (optionText === undefined || optionText === null) return;

  setAnswers((prev) => {
    const answerIndex = prev.findIndex(
      (a) => a.questionId === qId
    );

    if (isMSQ) {
      if (answerIndex === -1) {
        return [
          ...prev,
          { questionId: qId, selectedAnswers: [optionText] },
        ];
      }

      const currentAnswer = prev[answerIndex];
      const selected = currentAnswer.selectedAnswers || [];

      if (selected.includes(optionText)) {
        const updated = selected.filter(
          (x) => x !== optionText
        );

        if (updated.length === 0) {
          return prev.filter(
            (a) => a.questionId !== qId
          );
        }

        return [
          ...prev.slice(0, answerIndex),
          { questionId: qId, selectedAnswers: updated },
          ...prev.slice(answerIndex + 1),
        ];
      } else {
        return [
          ...prev.slice(0, answerIndex),
          {
            questionId: qId,
            selectedAnswers: [...selected, optionText],
          },
          ...prev.slice(answerIndex + 1),
        ];
      }
    }

    return [
      ...prev.filter((a) => a.questionId !== qId),
      { questionId: qId, selectedAnswer: optionText },
    ];
  });
};

  /* ================= SUBMIT ================= */
  const handleSubmit = async (auto = false) => {
    if (submitted || submittingRef.current) return;

    if (!auto && !window.confirm("Are you sure you want to submit?")) return;

    submittingRef.current = true;
    setSubmitted(true);

    try {
      await axios.post("/attempts/submit", { attemptId, answers });
      navigate("/student/dashboard");
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setSubmitted(false);
      submittingRef.current = false;
      alert("Submission failed.");
    }
  };

  /* ================= TIME FORMAT ================= */
  const formatTime = () => {
    const safeTime = Math.max(0, timeLeft || 0);
    const minutes = Math.floor(safeTime / 60);
    const seconds = safeTime % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-blue-600 border-r-transparent mx-auto mb-6"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Initializing Secure Exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
        <div className="text-center p-10 bg-white rounded-[2.5rem] shadow-2xl border border-rose-100 max-w-sm w-full">
          <div className="text-rose-500 text-5xl mb-6 font-bold italic">!</div>
          <p className="text-xl font-black text-slate-800 tracking-tight">{error}</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[current];
  const existingAnswer = answers.find(a => a.questionId === currentQuestion?._id);
  const selectedAnswer = existingAnswer?.selectedAnswer || null;
  const selectedAnswers = Array.isArray(existingAnswer?.selectedAnswers) ? existingAnswer.selectedAnswers : [];
  
  const isPassageQuestion = currentQuestion?.type === "PASSAGE";
  const hasImage = !!currentQuestion?.questionImage?.url;
  
  // LOGIC: Show split view if it's a passage OR if the question has an image
  const showSplitView = isPassageQuestion || hasImage;

  const getPassageData = () => {
    if (!isPassageQuestion || !currentQuestion?.questionText) return { passage: null, question: null };
    const fullText = language === "hindi" ? currentQuestion.questionText?.hindi : currentQuestion.questionText?.english;
    if (!fullText) return { passage: null, question: null };
    const separator = language === "hindi" ? "प्रश्न:" : "Question:";
    const parts = fullText.split(separator);
    return {
      passage: parts[0]?.replace(/Passage:|गद्यांश:/g, "").trim(),
      question: parts[1]?.trim(),
    };
  };

  const { passage: extractedPassage, question: extractedQuestion } = getPassageData();

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-[#FDFEFF] select-none z-[9999] font-sans">

      {/* HEADER */}
      <div className="bg-white border-b border-slate-100 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 z-[60] shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden p-2 text-slate-500 bg-slate-50 rounded-lg"
          >
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          <div className="hidden md:block h-6 w-1 bg-blue-600 rounded-full"></div>
          <h1 className="font-black text-slate-800 text-sm md:text-lg truncate max-w-[150px] md:max-w-md">{test.name}</h1>
        </div>

        <div className="flex items-center gap-3 md:gap-10">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 scale-90 md:scale-100">
            <button
              onClick={() => setLanguage("english")}
              className={`px-3 md:px-5 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all ${language === "english" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hindi")}
              className={`px-3 md:px-5 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all ${language === "hindi" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}
            >
              हि
            </button>
          </div>

          <div className={`px-4 md:px-6 py-1.5 md:py-2 rounded-xl font-mono text-lg md:text-2xl font-bold border-2 transition-all ${timeLeft < 300 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-900 border-slate-800 text-white shadow-lg shadow-slate-200'}`}>
            {formatTime()}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">

        {/* LEFT PANEL: Restored for Passage AND Images */}
        {showSplitView && (
          <div className="w-full md:w-[45%] h-full bg-white border-r border-slate-100 flex flex-col absolute md:relative z-40 transition-transform duration-300">
            <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {isPassageQuestion ? 'Passage Reference' : 'Visual Reference'}
              </span>
            </div>
            <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar flex items-center justify-center">
              {isPassageQuestion ? (
                <div className="text-[15px] md:text-[17px] text-slate-600 leading-[1.8] font-medium bg-blue-50/30 p-6 md:p-10 rounded-[2rem] border border-blue-100/50 italic w-full">
                  {extractedPassage || "No passage available"}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                        src={currentQuestion.questionImage.url} 
                        alt="Question Figure" 
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-xl border border-slate-100 p-2 bg-white"
                    />
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUESTION CONTENT */}
        <div className={`flex-1 bg-white overflow-y-auto custom-scrollbar z-30`}>
          <div className="max-w-5xl mx-auto h-full">
            <QuestionPanel
              current={current}
              totalQuestions={questions.length}
              currentQuestion={
                isPassageQuestion
                  ? {
                      ...currentQuestion,
                      questionText: {
                        english: language === "english" ? extractedQuestion : currentQuestion.questionText?.english,
                        hindi: language === "hindi" ? extractedQuestion : currentQuestion.questionText?.hindi,
                      },
                    }
                  : {
                      ...currentQuestion,
                      // Hide the image inside QuestionPanel if we are showing it in the split window
                      questionImage: showSplitView ? null : currentQuestion.questionImage
                    }
              }
              language={language}
              selectedAnswer={selectedAnswer}
              selectedAnswers={selectedAnswers}
              onSelectOption={selectOption}
              onPrevious={() => {
                markQuestionAsVisited(current);
                setCurrent((c) => Math.max(0, c - 1));
              }}
              onNext={() => {
                markQuestionAsVisited(current);
                setCurrent((c) => Math.min(questions.length - 1, c + 1));
              }}
              onSubmit={() => handleSubmit(false)}
              onToggleReview={() => toggleReviewForQuestion(current)}
              onClear={() => clearAnswerForQuestion(current)}
              isReviewed={reviewQuestions.has(currentQuestion?._id)}
              hideHeader={showSplitView}
            />
          </div>
        </div>

        {/* PALETTE */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
          md:translate-x-0 fixed md:relative right-0 top-0 bottom-0 
          w-[280px] md:w-80 bg-[#FBFCFE] border-l border-slate-100 
          flex flex-col z-[55] transition-transform duration-300
          shadow-[-10px_0_30px_rgba(0,0,0,0.02)]
        `}>
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] mb-8">Navigation</h3>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-50">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span> 
                <span className="text-[10px] font-black text-slate-500 uppercase">Solved</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-50">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> 
                <span className="text-[10px] font-black text-slate-500 uppercase">Missed</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-50">
                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full"></span> 
                <span className="text-[10px] font-black text-slate-500 uppercase">Review</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-50">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> 
                <span className="text-[10px] font-black text-slate-500 uppercase">New</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8">
              {questions.map((q, idx) => {
                const answered = answers.find(a => a.questionId === q._id);
                const isVisited = visitedQuestions.has(q._id);
                const isReview = reviewQuestions.has(q._id);
                const isCurrent = current === idx;

                let bg = "bg-slate-100 text-slate-400";
                if (isReview) bg = "bg-purple-600 text-white shadow-lg shadow-purple-100";
                else if (answered) bg = "bg-green-600 text-white shadow-lg shadow-green-100";
                else if (isVisited) bg = "bg-rose-500 text-white shadow-lg shadow-rose-100";

                return (
                  <button
                    key={q._id}
                    onClick={() => {
                      markQuestionAsVisited(idx);
                      setCurrent(idx);
                      if(window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`h-11 rounded-xl font-black text-xs transition-all duration-300 ${bg} ${isCurrent ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-[#FBFCFE] scale-105 z-10" : "hover:brightness-95 active:scale-95"}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 space-y-4">
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase">Attempt Rate</span><span className="text-sm font-black text-blue-600">{Math.round((answers.length / questions.length) * 100)}%</span></div>
               <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-blue-600 h-full transition-all duration-700" style={{width: `${(answers.length / questions.length) * 100}%`}}></div>
               </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
            <button
              onClick={() => handleSubmit(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Final Submit
            </button>
          </div>
        </div>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[10000] p-6">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center max-w-sm w-full border border-white/20">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 font-bold italic shadow-inner">!</div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Rule Alert</h2>
            <p className="text-[13px] text-slate-500 font-medium mb-8 leading-relaxed">
              Detection of forbidden movement. Further violations will terminate the session.
              <br /><br />
              <span className="bg-rose-50 text-rose-600 px-5 py-2 rounded-full font-black text-xs uppercase tracking-tighter">Violations: {violations} / 3</span>
            </p>

            <button
              onClick={async () => {
                setShowWarning(false);
                if (!document.fullscreenElement) {
                  await document.documentElement.requestFullscreen();
                }
              }}
              className="w-full py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl"
            >
              Back to Test
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

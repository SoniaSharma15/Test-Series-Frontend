/* =====================================================
   1️⃣ IMPORTS
===================================================== */

import {
  useEffect,
  useState,
  useRef,
  useMemo
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import axios from "../../services/axiosInstance";


/* =====================================================
   2️⃣ CORE STATE
===================================================== */

export default function ExamWindow() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  /* ---------- Test Data ---------- */
  const [test, setTest] = useState(null);

  /* ---------- Questions ---------- */
  const [rawQuestions, setRawQuestions] = useState([]);      // original from API
  const [flatQuestions, setFlatQuestions] = useState([]);    // flattened for rendering

  /* ---------- Navigation ---------- */
  const [currentIndex, setCurrentIndex] = useState(0);

  /* ---------- Answers ---------- */
  // Structure:
  // {
  //   "parentId_main": ["A"],
  //   "parentId_0": ["A","C"]
  // }
  const [answersMap, setAnswersMap] = useState({});

  /* ---------- Question State ---------- */
  const [visitedSet, setVisitedSet] = useState(new Set());
  const [reviewSet, setReviewSet] = useState(new Set());

  /* ---------- Exam Control ---------- */
  const [timeLeft, setTimeLeft] = useState(0);
  const [language, setLanguage] = useState("english");
  const [violations, setViolations] = useState(0);

  /* ---------- UI State ---------- */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ---------- Status ---------- */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Refs (Timer / Heartbeat / Safety) ---------- */
  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const examEndRef = useRef(null);
  const submittingRef = useRef(false);

  const fullscreenHandlerRef = useRef(null);
const visibilityHandlerRef = useRef(null);
const [showWarning, setShowWarning] = useState(false);

  /* =====================================================
   3️⃣ DERIVED HELPERS
===================================================== */

  /* ---------- 1. FLATTEN PASSAGE QUESTIONS ---------- */

  const flattenQuestions = (questions) => {
    const result = [];

    questions.forEach((q) => {

      // PASSAGE TYPE
      if (q.type === "PASSAGE" && Array.isArray(q.passageQuestions)) {

        q.passageQuestions.forEach((child, index) => {
          result.push({
            id: `${q._id}_${index}`,
            parentId: q._id,
            childIndex: index,

            type: child.type,

            passageText: q.passageText || null,
            image: child.image || null,

            questionText: child.questionText || null,
            assertion: child.assertion || null,
            reason: child.reason || null,

            options: child.options || [],

            marks: child.marks || 0,
            negativeMarks: child.negativeMarks || 0,
          });
        });

      } else {
        // NORMAL QUESTION

        result.push({
          id: `${q._id}_main`,
          parentId: q._id,
          childIndex: null,

          type: q.type,

          passageText: null,
          image: q.image || null,

          questionText: q.questionText || null,
          assertion: q.assertion || null,
          reason: q.reason || null,

          options: q.options || [],

          marks: q.marks || 0,
          negativeMarks: q.negativeMarks || 0,
        });
      }
    });

    return result;
  };


  /* ---------- 2. CURRENT QUESTION ---------- */

  const currentQuestion = useMemo(() => {
    return flatQuestions[currentIndex] || null;
  }, [flatQuestions, currentIndex]);


  /* ---------- 3. SPLIT VIEW CHECK ---------- */

  const showSplit = useMemo(() => {
    if (!currentQuestion) return false;

    return (
      currentQuestion.passageText ||
      currentQuestion.image
    );
  }, [currentQuestion]);


  /* ---------- 4. CHECK IF ANSWERED ---------- */

  const isAnswered = (questionId) => {
    const ans = answersMap[questionId];
    return Array.isArray(ans) && ans.length > 0;
  };


  /* ---------- 5. FORMAT TIME ---------- */

  const formatTime = () => {
    const safe = Math.max(0, timeLeft || 0);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  /* =====================================================
     4️⃣ EXAM LIFECYCLE
  ===================================================== */

  /* ---------- INIT EXAM ---------- */

  useEffect(() => {
    initExam();

    return () => {
      cleanup();
    };
  }, []);

  const initExam = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/attempts/exam/${attemptId}`);

      const { test, questions, startedAt, duration } = res.data;

      if (!questions || !questions.length) {
        throw new Error("No questions found");
      }

      setTest(test);
      setRawQuestions(questions);

      const flattened = flattenQuestions(questions);
      setFlatQuestions(flattened);

      /* ---- TIMER SETUP ---- */

      const startTime = new Date(startedAt).getTime();
      const durationMs = duration * 60 * 1000;

      examEndRef.current = startTime + durationMs;

      const remaining = Math.floor(
        (examEndRef.current - Date.now()) / 1000
      );

      if (remaining <= 0) {
        handleSubmit(true);
        return;
      }

      setTimeLeft(remaining);

      startTimer();
      startHeartbeat();
      startFullscreenMonitor();

      setLoading(false);

    } catch (err) {
      console.error("Exam Init Error:", err);
      setError("Failed to load exam.");
      setLoading(false);
    }
  };


  /* ---------- TIMER ---------- */

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


  /* ---------- HEARTBEAT ---------- */

  const startHeartbeat = () => {
    heartbeatRef.current = setInterval(() => {
      axios.post("/attempts/heartbeat", { attemptId })
        .catch(() => { });
    }, 15000);
  };


  /* ---------- FULLSCREEN + VIOLATION MONITOR ---------- */

 const startFullscreenMonitor = () => {

  const triggerViolation = () => {
    setViolations((prev) => {
      const next = prev + 1;

      if (next >= 3) {
        handleSubmit(true);
      } else {
        setShowWarning(true);
      }

      return next;
    });
  };

  fullscreenHandlerRef.current = () => {
    if (!document.fullscreenElement) {
      triggerViolation();
    }
  };

  visibilityHandlerRef.current = () => {
    if (document.hidden) {
      triggerViolation();
    }
  };

  document.addEventListener("fullscreenchange", fullscreenHandlerRef.current);
  document.addEventListener("visibilitychange", visibilityHandlerRef.current);

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
};



  /* ---------- CLEANUP ---------- */

const cleanup = () => {
  clearInterval(timerRef.current);
  clearInterval(heartbeatRef.current);

  if (fullscreenHandlerRef.current) {
    document.removeEventListener(
      "fullscreenchange",
      fullscreenHandlerRef.current
    );
  }

  if (visibilityHandlerRef.current) {
    document.removeEventListener(
      "visibilitychange",
      visibilityHandlerRef.current
    );
  }
};




  /* =====================================================
     5️⃣ ANSWER ENGINE
  ===================================================== */

  /* ---------- SELECT OPTION ---------- */

  const selectOption = (optionId) => {
    if (!currentQuestion) return;

    const qKey = currentQuestion.id;

    // mark visited
    setVisitedSet((prev) => new Set(prev).add(qKey));

    const isMSQ = currentQuestion.type === "MSQ";

    setAnswersMap((prev) => {

      const existing = prev[qKey] || [];

      // MSQ → toggle
      if (isMSQ) {

        if (existing.includes(optionId)) {
          const updated = existing.filter((id) => id !== optionId);

          return {
            ...prev,
            [qKey]: updated
          };
        } else {
          return {
            ...prev,
            [qKey]: [...existing, optionId]
          };
        }
      }

      // MCQ / MATH / ASSERTION_REASON → single select
      return {
        ...prev,
        [qKey]: [optionId]
      };
    });
  };


  /* ---------- CLEAR ANSWER ---------- */

  const clearAnswer = () => {
    if (!currentQuestion) return;

    const qKey = currentQuestion.id;

    setAnswersMap((prev) => {
      const copy = { ...prev };
      delete copy[qKey];
      return copy;
    });

    setVisitedSet((prev) => new Set(prev).add(qKey));
  };


  /* ---------- TOGGLE REVIEW ---------- */

  const toggleReview = () => {
    if (!currentQuestion) return;

    const qKey = currentQuestion.id;

    setReviewSet((prev) => {
      const copy = new Set(prev);

      if (copy.has(qKey)) {
        copy.delete(qKey);
      } else {
        copy.add(qKey);
      }

      return copy;
    });
  };


  /* ---------- NAVIGATION HELPERS ---------- */

  const goToNext = () => {
    if (currentIndex < flatQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };


  /* =====================================================
     6️⃣ SUBMIT ENGINE
  ===================================================== */

  /* ---------- BUILD PAYLOAD ---------- */

  const buildPayload = () => {
    const answers = [];

    Object.keys(answersMap).forEach((key) => {
      const selected = answersMap[key];

      if (!selected || !selected.length) return;

      const question = flatQuestions.find((q) => q.id === key);
      if (!question) return;

      const isMSQ = question.type === "MSQ";

      answers.push({
        questionId: question.parentId,
        childIndex: question.childIndex,   // IMPORTANT for PASSAGE
        selectedAnswer: !isMSQ ? selected[0] : undefined,
        selectedAnswers: isMSQ ? selected : undefined,
      });
    });

    return answers;
  };


  /* ---------- HANDLE SUBMIT ---------- */

  const handleSubmit = async (auto = false) => {
    if (submittingRef.current) return;

    if (!auto) {
      const confirmSubmit = window.confirm(
        "Are you sure you want to submit the exam?"
      );
      if (!confirmSubmit) return;
    }

    submittingRef.current = true;

    try {
      const payload = buildPayload();

      await axios.post("/attempts/submit", {
        attemptId,
        answers: payload,
      });

      cleanup();

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      navigate("/student/dashboard");

    } catch (err) {
      console.error("Submit Error:", err);
      submittingRef.current = false;
      alert("Submission failed. Please try again.");
    }
  };

/* =====================================================
   7️⃣ UI LAYOUT
===================================================== */

if (loading) {
  return (
    <div className="h-screen flex items-center justify-center">
      Loading Exam...
    </div>
  );
}

if (error) {
  return (
    <div className="h-screen flex items-center justify-center text-red-500">
      {error}
    </div>
  );
}

return (
  <div className="fixed inset-0 flex flex-col bg-[#FDFEFF] font-sans">

    {/* ================= HEADER ================= */}
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 text-slate-500"
        >
          ☰
        </button>

        <h1 className="font-black text-slate-800 text-lg truncate max-w-[300px]">
          {test?.name}
        </h1>
      </div>

      <div className="flex items-center gap-6">

        {/* Language Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setLanguage("english")}
            className={`px-4 py-1 text-xs font-bold rounded-md ${
              language === "english"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-500"
            }`}
          >
            EN
          </button>

          <button
            onClick={() => setLanguage("hindi")}
            className={`px-4 py-1 text-xs font-bold rounded-md ${
              language === "hindi"
                ? "bg-white text-blue-600 shadow"
                : "text-slate-500"
            }`}
          >
            HI
          </button>
        </div>

        {/* Timer */}
        <div className="px-6 py-2 bg-slate-900 text-white rounded-lg font-mono font-bold">
          {formatTime()}
        </div>
      </div>
    </div>


    {/* ================= BODY ================= */}
    <div className="flex flex-1 overflow-hidden">

      {/* ===== LEFT SPLIT PANEL ===== */}
      {showSplit && currentQuestion && (
        <div className="w-[45%] hidden md:flex bg-white border-r border-slate-200 flex-col">

          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-blue-600">
            Reference
          </div>

          <div className="flex-1 p-6 overflow-y-auto">

            {/* Passage */}
            {currentQuestion.passageText && (
              <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                {currentQuestion.passageText?.[language] ||
                 currentQuestion.passageText?.english}
              </div>
            )}

            {/* Image */}
            {currentQuestion.image && (
              <div className="mt-6">
                <img
                  src={currentQuestion.image}
                  alt="Question"
                  className="max-w-full rounded-lg shadow"
                />
              </div>
            )}

          </div>
        </div>
      )}


      {/* ===== QUESTION PANEL ===== */}
      <div className="flex-1 bg-white overflow-y-auto">
        {currentQuestion && (
          <div className="max-w-4xl mx-auto p-8">

            {/* Question Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black text-slate-500 uppercase">
                Question {currentIndex + 1}
              </span>

              <div className="text-xs font-bold text-slate-600">
                +{currentQuestion.marks} | -{currentQuestion.negativeMarks}
              </div>
            </div>

            {/* Question Text */}
            {currentQuestion.type !== "ASSERTION_REASON" && (
              <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
                {currentQuestion.questionText?.[language] ||
                 currentQuestion.questionText?.english}
              </h2>
            )}

            {/* Assertion Reason Block */}
            {currentQuestion.type === "ASSERTION_REASON" && (
              <div className="mb-8 space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <strong>Assertion:</strong><br />
                  {currentQuestion.assertion?.[language] ||
                   currentQuestion.assertion?.english}
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <strong>Reason:</strong><br />
                  {currentQuestion.reason?.[language] ||
                   currentQuestion.reason?.english}
                </div>
              </div>
            )}

            {/* OPTIONS */}
            <div className="space-y-4">
              {currentQuestion.options.map((opt) => {
                const selected =
                  answersMap[currentQuestion.id]?.includes(opt.id);

                const isMSQ = currentQuestion.type === "MSQ";

                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption(opt.id)}
                    className={`w-full text-left rounded-xl border-2 px-6 py-4 flex items-center gap-4 transition-all ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >

                    {/* Radio / Checkbox */}
                    <div className="shrink-0">
                      {isMSQ ? (
                        <div className={`h-5 w-5 border rounded ${
                          selected ? "bg-blue-600" : "bg-white"
                        }`} />
                      ) : (
                        <div className={`h-5 w-5 border rounded-full ${
                          selected ? "bg-blue-600" : "bg-white"
                        }`} />
                      )}
                    </div>

                    <div className="flex-1 font-semibold text-slate-700">
                      <span className="mr-2 font-black">
                        {opt.id}.
                      </span>
                      {opt.text?.[language] || opt.text?.english}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Controls */}
            <div className="mt-10 flex justify-between">

              <button
                onClick={clearAnswer}
                className="px-6 py-2 border rounded-lg"
              >
                Clear
              </button>

              <div className="flex gap-4">
                <button
                  disabled={currentIndex === 0}
                  onClick={goToPrevious}
                  className="px-6 py-2 border rounded-lg"
                >
                  Previous
                </button>

                {currentIndex < flatQuestions.length - 1 ? (
                  <button
                    onClick={goToNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Save & Next
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="px-6 py-2 bg-rose-600 text-white rounded-lg"
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>


      {/* ===== PALETTE ===== */}
      <div className={`
        ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0
        fixed md:relative right-0 top-0 bottom-0
        w-[280px] md:w-80
        bg-[#FBFCFE]
        border-l border-slate-200
        flex flex-col
        transition-transform duration-300
      `}>

        <div className="p-6 flex-1 overflow-y-auto">

          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
            Navigation
          </h3>

          {/* Question Grid */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {flatQuestions.map((q, idx) => {

              const answered = isAnswered(q.id);
              const visited = visitedSet.has(q.id);
              const review = reviewSet.has(q.id);
              const isCurrent = idx === currentIndex;

              let bg = "bg-slate-100 text-slate-400";

              if (review) bg = "bg-purple-600 text-white";
              else if (answered) bg = "bg-green-600 text-white";
              else if (visited) bg = "bg-rose-500 text-white";

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-lg font-bold text-xs ${bg} ${
                    isCurrent ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-xs font-bold mb-2">
              Attempted: {Object.keys(answersMap).length} / {flatQuestions.length}
            </div>

            <div className="w-full bg-slate-100 h-2 rounded">
              <div
                className="bg-blue-600 h-2 rounded"
                style={{
                  width: `${(Object.keys(answersMap).length / flatQuestions.length) * 100}%`
                }}
              />
            </div>
          </div>

        </div>

        <div className="p-6 border-t">
          <button
            onClick={() => handleSubmit(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-xs uppercase"
          >
            Final Submit
          </button>
        </div>
      </div>

    </div>
    {showWarning && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">

      <div className="text-4xl text-rose-500 mb-4 font-bold">!</div>

      <h2 className="text-xl font-black text-slate-800 mb-3">
        Rule Violation Detected
      </h2>

      <p className="text-sm text-slate-600 mb-6">
        Switching tabs or exiting fullscreen is not allowed.
        <br />
        <span className="font-bold text-rose-600">
          Violations: {violations} / 3
        </span>
      </p>

      <button
        onClick={async () => {
          setShowWarning(false);

          if (!document.fullscreenElement) {
            try {
              await document.documentElement.requestFullscreen();
            } catch {}
          }
        }}
        className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider"
      >
        Return to Exam
      </button>

    </div>
  </div>
)}
  </div>
);
}
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

    // Enter fullscreen on load
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
  
  // mark visited when selecting
  markQuestionAsVisited(current);

  // IMPORTANT: allow empty string except null/undefined
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

    // MCQ
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
      <div className="h-screen flex items-center justify-center">
        Initializing Secure Examination...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  const currentQuestion = questions[current];
  const isMSQQuestion = currentQuestion?.type === "MSQ";
  const existingAnswer = answers.find(
    (a) => a.questionId === currentQuestion?._id
  );

  const selectedAnswer = existingAnswer?.selectedAnswer || null;
  const selectedAnswers = Array.isArray(existingAnswer?.selectedAnswers)
    ? existingAnswer.selectedAnswers
    : [];

  const hasPassage = currentQuestion?.passage && currentQuestion.passage.trim() !== "";
  const isMathQuestion = !!(currentQuestion?.subject && typeof currentQuestion.subject === "string" && (currentQuestion.subject.toLowerCase().includes("math") || currentQuestion.subject.toLowerCase().includes("quantitative")));
  const showThreePartLayout = hasPassage || isMathQuestion;

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-gray-100 select-none z-[9999]">

      {/* HEADER */}
      <div className="bg-blue-900 text-white flex justify-between items-center px-6 py-3">
        <h1 className="font-bold text-lg">{test.name}</h1>

        <div className="flex items-center gap-6">
          {/* Language Toggle */}
          <div className="flex bg-white rounded overflow-hidden text-sm font-semibold">
            <button
              onClick={() => setLanguage("english")}
              className={`px-4 py-1 ${language === "english" ? "bg-blue-600 text-white" : "text-blue-600"}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hindi")}
              className={`px-4 py-1 ${language === "hindi" ? "bg-blue-600 text-white" : "text-blue-600"}`}
            >
              हिन्दी
            </button>
          </div>

          {/* Timer */}
          <div className="text-xl font-mono bg-black/30 px-4 py-1 rounded">
            {formatTime()}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* PART 1: PASSAGE (conditional) */}
        {showThreePartLayout && (
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-bold mb-4">{isMathQuestion ? "Problem" : "Passage"}</h3>
            <div className="text-sm text-gray-700">
              {currentQuestion?.passage || "No passage available"}
            </div>
          </div>
        )}

        {/* QUESTION SECTION */}
        <div style={showThreePartLayout ? { width: '50%' } : { width: '75%' }}>
          <QuestionPanel
            current={current}
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
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
            hideHeader={showThreePartLayout}
          />
        </div>

        {/* PALETTE */}
        <div style={showThreePartLayout ? { width: '16.666%' } : { width: '25%' }} className={`bg-gray-50 border-l p-6 overflow-y-auto`}>
          <h3 className="font-bold mb-4">Question Palette</h3>

          {/* Legend */}
          <div className="mb-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 bg-green-500 rounded" /> <span>Answered</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="w-4 h-4 bg-red-500 rounded" /> <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="w-4 h-4 bg-gray-300 rounded" /> <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="w-4 h-4 bg-purple-500 rounded" /> <span>Review</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {questions.map((q, idx) => {
              const answered = answers.find((a) => a.questionId === q._id);
              const isVisited = visitedQuestions.has(q._id);
              const isReview = reviewQuestions.has(q._id);
              const isCurrent = current === idx;

              let bg = "bg-gray-300 text-gray-800";
              if (isReview) bg = "bg-purple-500 text-white";
              else if (answered) bg = "bg-green-500 text-white";
              else if (isVisited) bg = "bg-red-500 text-white";

              return (
                <button
                  key={q._id}
                  onClick={() => {
                    markQuestionAsVisited(idx);
                    setCurrent(idx);
                  }}
                  className={`h-12 rounded font-bold text-sm flex items-center justify-center ${bg} ${isCurrent ? "ring-2 ring-blue-600" : "hover:opacity-90"}`}
                  title={`Q${idx + 1} - ${isReview ? "Review" : answered ? "Answered" : isVisited ? "Not Answered" : "Not Visited"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 bg-white p-3 rounded text-sm border border-gray-200">
            <div className="flex justify-between"><span>Answered</span><strong>{answers.length}</strong></div>
            <div className="flex justify-between mt-1"><span>Visited (no answer)</span><strong>{Math.max(0, visitedQuestions.size - answers.length)}</strong></div>
            <div className="flex justify-between mt-1"><span>Not Visited</span><strong>{Math.max(0, questions.length - visitedQuestions.size)}</strong></div>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            className="mt-6 w-full bg-red-600 text-white py-2 rounded">
            FINAL SUBMIT
          </button>
        </div>
      </div>

      {showWarning && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Warning Detected
            </h2>
            <p className="text-sm mb-4">
              You have violated exam rules.
              <br />
              Violations: {violations} / 3
            </p>

            <button
              onClick={async () => {
                setShowWarning(false);
                if (!document.fullscreenElement) {
                  await document.documentElement.requestFullscreen();
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

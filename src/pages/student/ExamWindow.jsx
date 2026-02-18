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

  // IMPORTANT: allow empty string except null/
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Initializing Secure Examination...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600">{error}</p>
        </div>
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

/* ✅ FIRST define this */
const isPassageQuestion = currentQuestion?.type === "PASSAGE";

/* ✅ THEN use it */
const showThreePartLayout = isPassageQuestion;

/* ================= SPLIT PASSAGE + QUESTION ================= */
const getPassageData = () => {
  if (!isPassageQuestion || !currentQuestion?.questionText) {
    return { passage: null, question: null };
  }

  const fullText =
    language === "hindi"
      ? currentQuestion.questionText?.hindi
      : currentQuestion.questionText?.english;

  if (!fullText) return { passage: null, question: null };

  if (language === "hindi") {
    const parts = fullText.split("प्रश्न:");
    return {
      passage: parts[0]?.replace("गद्यांश:", "").trim(),
      question: parts[1]?.trim(),
    };
  }

  const parts = fullText.split("Question:");
  return {
    passage: parts[0]?.replace("Passage:", "").trim(),
    question: parts[1]?.trim(),
  };
};

const { passage: extractedPassage, question: extractedQuestion } =
  getPassageData();



  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col bg-gradient-to-br from-gray-100 to-gray-200 select-none z-[9999]">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white flex justify-between items-center px-6 py-4 shadow-lg">
        <h1 className="font-bold text-xl tracking-wide">{test.name}</h1>

        <div className="flex items-center gap-6">
          {/* Language Toggle */}
          <div className="flex bg-white rounded-lg overflow-hidden shadow-md text-sm font-semibold">
            <button
              onClick={() => setLanguage("english")}
              className={`px-5 py-2 transition-colors duration-200 ${language === "english" ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-50"}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("hindi")}
              className={`px-5 py-2 transition-colors duration-200 ${language === "hindi" ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-50"}`}
            >
              हिन्दी
            </button>
          </div>

          {/* Timer */}
          <div className="text-2xl font-mono bg-black/40 px-5 py-2 rounded-lg shadow-inner">
            {formatTime()}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* PART 1: PASSAGE (conditional) */}
        {showThreePartLayout && (
          <div className="w-1/3 bg-gradient-to-b from-gray-50 to-gray-100 border-r-2 border-gray-300 p-6 overflow-y-auto shadow-inner">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">Passage</h3>
            <div className="text-sm text-gray-700 leading-relaxed">
              {extractedPassage || "No passage available"}
            </div>
          </div>
        )}

        {/* QUESTION SECTION */}
        <div className={`${showThreePartLayout ? 'w-1/2' : 'w-3/4'} bg-white shadow-inner`}>
          <QuestionPanel
            current={current}
            totalQuestions={questions.length}
            currentQuestion={
              isPassageQuestion
                ? {
                    ...currentQuestion,
                    questionText: {
                      english:
                        language === "english"
                          ? extractedQuestion
                          : currentQuestion.questionText?.english,
                      hindi:
                        language === "hindi"
                          ? extractedQuestion
                          : currentQuestion.questionText?.hindi,
                    },
                  }
                : currentQuestion
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
            hideHeader={showThreePartLayout}
          />
        </div>

        {/* PALETTE */}
        <div className={`${showThreePartLayout ? 'w-1/6' : 'w-1/4'} bg-gradient-to-b from-gray-50 to-gray-100 border-l-2 border-gray-300 p-6 overflow-y-auto shadow-inner`}>
          <h3 className="font-bold text-lg mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">Question Palette</h3>

          {/* Legend */}
          <div className="mb-6 text-sm space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 bg-green-500 rounded-full shadow-sm"></span> <span className="text-gray-700">Answered</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 bg-red-500 rounded-full shadow-sm"></span> <span className="text-gray-700">Not Answered</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 bg-gray-400 rounded-full shadow-sm"></span> <span className="text-gray-700">Not Visited</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 bg-purple-500 rounded-full shadow-sm"></span> <span className="text-gray-700">Review</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {questions.map((q, idx) => {
              const answered = answers.find((a) => a.questionId === q._id);
              const isVisited = visitedQuestions.has(q._id);
              const isReview = reviewQuestions.has(q._id);
              const isCurrent = current === idx;

              let bg = "bg-gray-400 text-gray-800";
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
                  className={`h-12 rounded-lg font-bold text-sm flex items-center justify-center ${bg} ${isCurrent ? "ring-4 ring-blue-600 ring-opacity-50" : "hover:opacity-90"} transition-all duration-200 shadow-md`}
                  title={`Q${idx + 1} - ${isReview ? "Review" : answered ? "Answered" : isVisited ? "Not Answered" : "Not Visited"}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="bg-white p-4 rounded-lg text-sm border border-gray-300 shadow-md mb-6">
            <div className="flex justify-between mb-2"><span className="text-gray-700">Answered</span><strong className="text-green-600">{answers.length}</strong></div>
            <div className="flex justify-between mb-2"><span className="text-gray-700">Visited (no answer)</span><strong className="text-red-600">{Math.max(0, visitedQuestions.size - answers.length)}</strong></div>
            <div className="flex justify-between"><span className="text-gray-700">Not Visited</span><strong className="text-gray-600">{Math.max(0, questions.length - visitedQuestions.size)}</strong></div>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
          >
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

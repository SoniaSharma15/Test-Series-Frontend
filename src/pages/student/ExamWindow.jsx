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
import toast from "react-hot-toast";

import QuestionPanel from "../../components/student/exam/QuestionPanel";
import Palette from "../../components/student/exam/Palette";


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
  const answersRef = useRef({});
  const securityCleanupRef = useRef(null);

  const fullscreenHandlerRef = useRef(null);
  const visibilityHandlerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const violationLockRef = useRef(false);
  const lastViolationTimeRef = useRef(0);
  const violationInProgressRef = useRef(false);
  const flatQuestionsRef = useRef([]);
  const devToolsIntervalRef = useRef(null);
  const violationToastRef = useRef(null);
  const rightClickHandledRef = useRef(false);
  const examFinishedRef = useRef(false);
  const securityInitializedRef = useRef(false);

  /* =====================================================
   3️⃣ DERIVED HELPERS
===================================================== */

  /* ---------- 1. FLATTEN PASSAGE QUESTIONS ---------- */

  const getTextByLanguage = (obj, lang) => {
    if (!obj) return "";

    // If object is string (old data support)
    if (typeof obj === "string") return obj;

    // 1️⃣ Try selected language
    if (obj[lang]) return obj[lang];

    // 2️⃣ Fallback to english
    if (obj.english) return obj.english;

    // 3️⃣ Fallback to hindi
    if (obj.hindi) return obj.hindi;

    return "";
  };

  const showViolationToast = (message) => {
    if (violationToastRef.current) return;

    violationToastRef.current = toast.error(message, {
      duration: 3000,
      onClose: () => {
        violationToastRef.current = null;
      },
    });
  };


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
          assertion: q.assertion || null, // 🔥 FIXED: was child.assertion
          reason: q.reason || null,       // 🔥 FIXED: was child.reason

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

  useEffect(() => {
    if (!currentQuestion) return;

    setVisitedSet((prev) => {
      const updated = new Set(prev);
      updated.add(currentQuestion.id);
      return updated;
    });
  }, [currentQuestion]);


  useEffect(() => {
    answersRef.current = answersMap;
  }, [answersMap]);


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
      flatQuestionsRef.current = flattened;   // 🔥 ADD THIS

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

      if (!securityInitializedRef.current) {
        securityInitializedRef.current = true;
        const cleanupSecurity = startSecurityRestrictions();
        securityCleanupRef.current = cleanupSecurity;
      }

      setLoading(false);

    } catch (err) {
      console.error("Exam Init Error:", err); // Helpful for debugging
      const message =
        err?.response?.data?.message ||
        "Failed to load exam. Please refresh and try again.";

      setError(message);
      setLoading(false);

      toast.error(message);
    }
  };


  /* ---------- TIMER ---------- */

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const remaining = Math.floor((examEndRef.current - Date.now()) / 1000);
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

  const startSecurityRestrictions = () => {

    /* ================================
       1️⃣ BLOCK KEYBOARD SHORTCUTS
    ================================= */
    const blockKeys = (e) => {
      const key = e.key.toLowerCase();

      // 🔒 DevTools & Inspect
      if (
        key === "f12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && key === "u")
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerLocalWarning("DEVTOOLS");
        return;
      }

      // 🔒 Copy / Paste / Cut / Select / Save / Print
      if (
        e.ctrlKey &&
        ["c", "v", "x", "a", "s", "p"].includes(key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerLocalWarning("KEYBOARD_BLOCKED");
      }
    };


    /* ================================
       2️⃣ BLOCK RIGHT CLICK
    ================================= */
    const blockRightClick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      // 👇 prevent multiple toast from same click
      if (rightClickHandledRef.current) return;

      rightClickHandledRef.current = true;

      triggerLocalWarning("RIGHT_CLICK");

      setTimeout(() => {
        rightClickHandledRef.current = false;
      }, 200); // small delay enough
    };


    /* ================================
       3️⃣ BLOCK SCREENSHOT KEY
    ================================= */
    const blockScreenshot = (e) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        triggerLocalWarning("SCREENSHOT_KEY");

        // Optional clipboard override trick
        if (navigator.clipboard) {
          navigator.clipboard.writeText("Screenshot is disabled.");
        }
      }
    };


    /* ================================
       4️⃣ BLOCK DRAG
    ================================= */
    const blockDrag = (e) => {
      e.preventDefault();
      triggerLocalWarning("DRAG_ATTEMPT");
    };


    /* ================================
       5️⃣ BLOCK TEXT SELECTION
    ================================= */
    const blockSelect = (e) => {
      e.preventDefault();
    };


    /* ================================
       6️⃣ BLUR ON TAB SWITCH
    ================================= */
    const blurOnTabSwitch = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(8px)";
      } else {
        document.body.style.filter = "none";
      }
    };


    /* ================================
       7️⃣ DETECT WINDOW RESIZE (Split Screen)
    ================================= */
    const detectResize = () => {
      if (window.outerWidth < screen.width * 0.85) {
        triggerLocalWarning("WINDOW_RESIZE");
      }
    };


    /* ================================
       APPLY CSS PROTECTION
    ================================= */
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";
    document.body.style.msUserSelect = "none";


    /* ================================
       ADD ALL LISTENERS
    ================================= */
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("keyup", blockScreenshot);
    document.addEventListener("contextmenu", blockRightClick);
    document.addEventListener("dragstart", blockDrag);
    document.addEventListener("selectstart", blockSelect);
    document.addEventListener("visibilitychange", blurOnTabSwitch);
    window.addEventListener("resize", detectResize);


    /* ================================
       RETURN CLEANUP FUNCTION
    ================================= */
    return () => {
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("keyup", blockScreenshot);
      document.removeEventListener("contextmenu", blockRightClick);
      document.removeEventListener("dragstart", blockDrag);
      document.removeEventListener("selectstart", blockSelect);
      document.removeEventListener("visibilitychange", blurOnTabSwitch);
      window.removeEventListener("resize", detectResize);

      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.msUserSelect = "";
      document.body.style.filter = "";
    };
  };


  const triggerLocalWarning = (type) => {
    if (examFinishedRef.current) return;

    toast.error("Action not allowed in exam!", {
      duration: 1500,
    });

    // 🔥 Only serious violations go to backend
    if (type === "TAB" || type === "FULLSCREEN") {
      axios.post("/attempts/violation", {
        attemptId,
        type,
      }).catch(() => { });
    }
  };


  /* ---------- FULLSCREEN + VIOLATION MONITOR ---------- */

  const startFullscreenMonitor = () => {

    const triggerViolation = async (type) => {
      if (examFinishedRef.current) return;

      const now = Date.now();

      if (violationInProgressRef.current) return;
      if (now - lastViolationTimeRef.current < 3000) return;

      violationInProgressRef.current = true;
      lastViolationTimeRef.current = now;

      try {
        showViolationToast("Violation detected!");

        // 🔥 ONLY TAB & FULLSCREEN go to backend
        if (type === "TAB" || type === "FULLSCREEN") {
          const res = await axios.post("/attempts/violation", {
            attemptId,
            type,
          });

          setViolations((prev) => prev + 1);

          if (res.data?.shouldAutoSubmit) {
            showViolationToast("Maximum violations reached. Submitting exam...");
            handleSubmit(true);
            return;
          }
        }

        setShowWarning(true);

      } catch (error) {
        showViolationToast("Security sync failed.");
      } finally {
        setTimeout(() => {
          violationInProgressRef.current = false;
        }, 1000);
      }
    };

    const detectDevTools = () => {
      const threshold = 160;

      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        triggerViolation("DEVTOOLS_OPEN");
      }
    };

    devToolsIntervalRef.current = setInterval(() => {
      if (violationInProgressRef.current) return;
      detectDevTools();
    }, 2000);

    /* ===============================
       FULLSCREEN EXIT DETECTION
    =============================== */
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !showWarning && !violationInProgressRef.current) {
        triggerViolation("FULLSCREEN");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !showWarning && !violationInProgressRef.current) {
        triggerViolation("TAB");
      }
    };

    fullscreenHandlerRef.current = handleFullscreenChange;
    visibilityHandlerRef.current = handleVisibilityChange;

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    /* ===============================
       ENTER FULLSCREEN (User Required)
    =============================== */
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .catch(() => {
          toast.error("Fullscreen is mandatory for this exam.", {
            icon: "🖥️",
            duration: 4000,
          });
        });
    }
  };



  /* ---------- CLEANUP ---------- */

  const cleanup = () => {
    clearInterval(timerRef.current);
    clearInterval(heartbeatRef.current);

    if (devToolsIntervalRef.current) {
      clearInterval(devToolsIntervalRef.current);
    }

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

    if (securityCleanupRef.current) {
      securityCleanupRef.current();
    }

    securityInitializedRef.current = false; // 🔥 ADD THIS
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
      let updatedAnswers;

      if (isMSQ) {
        if (existing.includes(optionId)) {
          updatedAnswers = existing.filter((id) => id !== optionId);
        } else {
          updatedAnswers = [...existing, optionId];
        }
      } else {
        updatedAnswers = [optionId];
      }

      const updatedMap = {
        ...prev,
        [qKey]: updatedAnswers
      };

      // 🔥 immediately sync ref
      answersRef.current = updatedMap;


      return updatedMap;
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

    Object.keys(answersRef.current).forEach((key) => {
      const selected = answersRef.current[key];

      if (!selected || !selected.length) return;

      const question = flatQuestionsRef.current.find((q) => q.id === key); if (!question) return;

      const isMSQ = question.type === "MSQ";

      answers.push({
        questionId: question.parentId,
        childIndex: question.childIndex,
        selectedAnswer: !isMSQ ? selected[0] : undefined,
        selectedAnswers: isMSQ ? selected : undefined,
      });
    });


    return answers;
  };


  /* ---------- HANDLE SUBMIT ---------- */

  const handleSubmit = async (skipConfirm = false) => {
    if (submittingRef.current) return;

    if (!skipConfirm) {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <span>Are you sure you want to submit?</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSubmit(true);
              }}
              className="px-3 py-1 bg-green-600 text-white text-xs rounded"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-xs rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ));
      return;
    }

    submittingRef.current = true;
    examFinishedRef.current = true;

    try {
      answersRef.current = { ...answersRef.current };
      const payload = buildPayload();

      await axios.post("/attempts/submit", {
        attemptId,
        answers: payload,
      });

      // 🔥 Stop all listeners
      cleanup();

      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.msUserSelect = "";
      document.body.style.filter = "";

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch { }
      }

      // 🔥 HARD REFRESH TO DASHBOARD
      window.location.replace("/student/dashboard");

    } catch (err) {
      submittingRef.current = false;
      examFinishedRef.current = false;
      toast.error("Submission failed.");
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
      <div className="h-screen flex items-center justify-center text-red-500 px-4 text-center">
        <div>
            <p className="text-xl font-bold mb-2">Error Loading Exam</p>
            <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MOBILE ACCESSIBLE EXAM WINDOW */}
      <div className="flex flex-col h-screen bg-[#FDFEFF] font-sans relative overflow-hidden">

        {/* 🔐 WATERMARK */}
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center text-4xl md:text-7xl font-black text-gray-400 opacity-20 rotate-[-30deg] select-none z-40 tracking-widest text-center px-4">
          {test?.name} • {attemptId}
        </div>

        {/* ================= HEADER ================= */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm z-30 relative">

          <div className="flex items-center gap-2 md:gap-4">
            {/* Hamburger Menu Button - Works on Mobile Now */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <h1 className="font-black text-slate-800 text-sm md:text-lg truncate max-w-[150px] md:max-w-[300px]">
              {test?.name}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-6">

            {/* Language Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setLanguage("english")}
                className={`px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${language === "english"
                  ? "bg-white text-blue-600 shadow"
                  : "text-slate-500"
                  }`}
              >
                EN
              </button>

              <button
                onClick={() => setLanguage("hindi")}
                className={`px-3 py-1 text-[10px] md:text-xs font-bold rounded-md ${language === "hindi"
                  ? "bg-white text-blue-600 shadow"
                  : "text-slate-500"
                  }`}
              >
                HI
              </button>
            </div>

            {/* Timer */}
            <div className="px-3 md:px-6 py-1.5 md:py-2 bg-slate-900 text-white rounded-lg font-mono font-bold text-xs md:text-sm">
              {formatTime()}
            </div>
          </div>
        </div>


        {/* ================= BODY ================= */}
        <div className="flex flex-1 overflow-hidden relative">

          {/* ===== LEFT SPLIT PANEL (Reference) ===== */}
          {showSplit && currentQuestion && (
            <div className="hidden md:flex w-[45%] bg-white border-r border-slate-200 flex-col z-20">

              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-blue-600">
                Reference
              </div>

              <div className="flex-1 p-6 overflow-y-auto">

                {/* Passage */}
                {currentQuestion.passageText && (
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {getTextByLanguage(currentQuestion.passageText, language)}
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
          <div className="flex-1 h-full overflow-y-auto relative z-10">
             {/* If mobile and showSplit is true, render passage here above question */}
             {showSplit && currentQuestion && (
                <div className="md:hidden p-4 bg-slate-50 border-b border-slate-200">
                   <div className="text-xs font-black uppercase tracking-wider text-blue-600 mb-2">Reference</div>
                   {currentQuestion.passageText && (
                      <div className="text-slate-700 text-sm whitespace-pre-line mb-4">
                        {getTextByLanguage(currentQuestion.passageText, language)}
                      </div>
                   )}
                   {currentQuestion.image && (
                      <img
                        src={currentQuestion.image}
                        alt="Question"
                        className="max-w-full rounded-lg shadow-sm mb-2"
                      />
                   )}
                </div>
             )}

            <QuestionPanel
              currentQuestion={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={flatQuestions.length}
              answersMap={answersMap}
              language={language}
              selectOption={selectOption}
              clearAnswer={clearAnswer}
              goToNext={goToNext}
              goToPrevious={goToPrevious}
              handleSubmit={handleSubmit}
              toggleReview={toggleReview}
              reviewSet={reviewSet}
            />
          </div>




          {/* ===== PALETTE SIDEBAR ===== */}
          
          {/* Mobile Overlay */}
          {isSidebarOpen && (
             <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsSidebarOpen(false)}
             ></div>
          )}

          <div className={`
             fixed md:relative inset-y-0 right-0 z-50 
             bg-white shadow-2xl md:shadow-none
             transform transition-transform duration-300 ease-in-out
             border-l border-slate-200
             w-[85%] md:w-80
             ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
             md:translate-x-0 flex flex-col
          `}>
            <Palette
              flatQuestions={flatQuestions}
              currentIndex={currentIndex}
              setCurrentIndex={(index) => {
                 setCurrentIndex(index);
                 if(window.innerWidth < 768) setIsSidebarOpen(false); // Auto close on mobile select
              }}
              answersMap={answersMap}
              visitedSet={visitedSet}
              reviewSet={reviewSet}
              handleSubmit={handleSubmit}
              closeSidebar={() => setIsSidebarOpen(false)} // Pass close handler
            />
          </div>

        </div>
        {showWarning && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center mx-4">

              <div className="text-4xl text-rose-500 mb-4 font-bold">!</div>

              <h2 className="text-xl font-black text-slate-800 mb-3">
                Rule Violation Detected
              </h2>

              <p className="text-sm text-slate-600 mb-6">
                Switching tabs or exiting fullscreen is not allowed.
                <br />
                <span className="font-bold text-rose-600">
                  Violations: {violations} / 5
                </span>
              </p>

              <button
                onClick={async () => {
                  setShowWarning(false);

                  if (!document.fullscreenElement) {
                    try {
                      await document.documentElement.requestFullscreen();
                    } catch { }
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
    </>
  );
}
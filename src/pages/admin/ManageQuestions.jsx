// src/pages/admin/ManageQuestions.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../services/axiosInstance";
import toast from "react-hot-toast";

import AdminSidebar from "../../components/admin/AdminSidebar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import {
  ChevronRight,
  ClipboardList,
  ClipboardListIcon,
  FileText,
  LayoutDashboard,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";

/* =========================================================
   Responsive Hook (Same behavior as your previous version)
========================================================= */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);

    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    setMatches(mql.matches);

    return () => {
      if (mql.removeEventListener)
        mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}


/* =========================================================
   2️⃣ CONSTANTS (Model Compatible)
========================================================= */

// Fixed Option IDs (Model requires exactly these)
const OPTION_IDS = ["A", "B", "C", "D"];

// Question Types (Match backend enum)
const QUESTION_TYPES = [
  "MCQ",
  "MSQ",
  "ASSERTION_REASON",
  "MATH",
  "PASSAGE",
];

// Difficulty (Match backend enum)
const DIFFICULTY_LEVELS = ["EASY", "MEDIUM", "HARD"];

/* ---------- Empty Option Template ---------- */
const emptyOptions = () =>
  OPTION_IDS.map((id) => ({
    id,
    text: {
      english: "",
      hindi: "",
    },
  }));

/* ---------- Empty Normal Question ---------- */
const emptyNormalForm = () => ({
  type: "MCQ",
  difficulty: "MEDIUM",

  questionText: {
    english: "",
    hindi: "",
  },

  assertion: {
    english: "",
    hindi: "",
  },

  reason: {
    english: "",
    hindi: "",
  },

  options: emptyOptions(),

  correctAnswers: [],

  marks: 1,
  negativeMarks: 0,

  explanation: {
    english: "",
    hindi: "",
  },
});

/* ---------- Empty Child Question (For Passage) ---------- */
const emptyChildQuestion = () => ({
  type: "MCQ",

  questionText: {
    english: "",
    hindi: "",
  },

  assertion: {
    english: "",
    hindi: "",
  },

  reason: {
    english: "",
    hindi: "",
  },

  options: emptyOptions(),

  correctAnswers: [],

  marks: 1,
  negativeMarks: 0,

  explanation: {
    english: "",
    hindi: "",
  },

  image: "", // will be handled via FormData if needed later
});

/* ---------- Empty Passage ---------- */
const emptyPassageForm = () => ({
  difficulty: "MEDIUM",

  passageText: {
    english: "",
    hindi: "",
  },

  passageQuestions: [],
});
const getARDefaultOptions = () => [
  {
    id: "A",
    text: {
      english: "Both A and R are true and R is the correct explanation of A.",
      hindi: "A और R दोनों सही हैं तथा R, A की सही व्याख्या है।",
    },
  },
  {
    id: "B",
    text: {
      english: "Both A and R are true but R is NOT the correct explanation of A.",
      hindi: "A और R दोनों सही हैं लेकिन R, A की सही व्याख्या नहीं है।",
    },
  },
  {
    id: "C",
    text: { english: "A is true but R is false.", hindi: "A सही है लेकिन R गलत है।" },
  },
  {
    id: "D",
    text: { english: "A is false but R is true.", hindi: "A गलत है लेकिन R सही है।" },
  },
];


/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function ManageQuestions() {
  const { testId } = useParams();

    /* =========================================================
     3️⃣ GLOBAL STATE SECTION
  ========================================================= */

  // Mode: NORMAL or PASSAGE
  const [mode, setMode] = useState("NORMAL");

  // Loading & Submission
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Questions list
  const [questions, setQuestions] = useState([]);

  // Edit Mode
  const [editId, setEditId] = useState(null);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Language Controls
  const [langMode, setLangMode] = useState("EN"); // EN | HI

  // Image (for MATH question)
  const [imageFile, setImageFile] = useState(null);

  /* ---------------- NORMAL QUESTION FORM ---------------- */

  const [form, setForm] = useState(emptyNormalForm());

  /* ---------------- PASSAGE FORM ---------------- */

  const [passage, setPassage] = useState(emptyPassageForm());

    /* =========================================================
     4️⃣ UTILITY FUNCTIONS
  ========================================================= */

  /* ---------- Reset Normal Form ---------- */
  const resetNormal = () => {
    setForm(emptyNormalForm());
    setImageFile(null);
    setEditId(null);
  };

  /* ---------- Reset Passage ---------- */
  const resetPassage = () => {
    setPassage(emptyPassageForm());
    setEditId(null);
  };

  /* ---------- Handle Option Text Change ---------- */
  const handleOptionChange = (index, field, value) => {
    const updated = [...form.options];
    updated[index].text[field] = value;
    setForm({ ...form, options: updated });
  };

  /* ---------- Toggle Correct Answer (MCQ/MSQ Safe) ---------- */
  const toggleCorrect = (id) => {
    if (form.type === "MSQ") {
      if (form.correctAnswers.includes(id)) {
        setForm({
          ...form,
          correctAnswers: form.correctAnswers.filter((x) => x !== id),
        });
      } else {
        setForm({
          ...form,
          correctAnswers: [...form.correctAnswers, id],
        });
      }
    } else {
      setForm({
        ...form,
        correctAnswers: [id],
      });
    }
  };

  /* ---------- Add Passage Question ---------- */
  const addPassageQuestion = () => {
    setPassage({
      ...passage,
      passageQuestions: [
        ...passage.passageQuestions,
        emptyChildQuestion(),
      ],
    });
  };

  /* ---------- Remove Passage Question ---------- */
  const removePassageQuestion = (index) => {
    const updated = [...passage.passageQuestions];
    updated.splice(index, 1);
    setPassage({
      ...passage,
      passageQuestions: updated,
    });
  };

  /* ---------- Update Passage Question Field ---------- */
  const updatePassageQuestion = (index, key, value) => {
    const updated = [...passage.passageQuestions];
    updated[index][key] = value;
    setPassage({
      ...passage,
      passageQuestions: updated,
    });
  };

  /* ---------- Update Passage Option ---------- */
  const updatePassageOption = (qIndex, optIndex, field, value) => {
    const updated = [...passage.passageQuestions];
    updated[qIndex].options[optIndex].text[field] = value;
    setPassage({
      ...passage,
      passageQuestions: updated,
    });
  };

  /* ---------- Toggle Passage Correct ---------- */
  const togglePassageCorrect = (qIndex, id) => {
    const updated = [...passage.passageQuestions];
    const question = updated[qIndex];

    if (question.type === "MSQ") {
      if (question.correctAnswers.includes(id)) {
        question.correctAnswers = question.correctAnswers.filter(
          (x) => x !== id
        );
      } else {
        question.correctAnswers.push(id);
      }
    } else {
      question.correctAnswers = [id];
    }

    setPassage({ ...passage, passageQuestions: updated });
  };

    /* =========================================================
     5️⃣ API FUNCTIONS
  ========================================================= */

  /* ---------- Fetch Questions By Test ---------- */
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/questions/${testId}`);
      setQuestions(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (testId) {
    fetchQuestions();
  }
}, [testId]);


  /* ---------- Submit Normal Question ---------- */
  const handleSubmitNormal = async () => {
    try {
      setSubmitting(true);

      const basePayload = {
        testId,
        type: form.type,
        difficulty: form.difficulty,
        marks: Number(form.marks),
        negativeMarks: Number(form.negativeMarks),
        explanation: form.explanation,
        options: form.options,
        correctAnswers: form.correctAnswers,
      };

      if (form.type === "ASSERTION_REASON") {
        basePayload.assertion = form.assertion;
        basePayload.reason = form.reason;
      } else {
        basePayload.questionText = form.questionText;
      }

      /* ---------- MATH (Image Upload via FormData) ---------- */
      if (form.type === "MATH") {
        const fd = new FormData();

        Object.entries(basePayload).forEach(([key, value]) => {
          fd.append(
            key,
            typeof value === "object"
              ? JSON.stringify(value)
              : value
          );
        });

        if (imageFile) {
          fd.append("image", imageFile);
        }

        if (editId) {
          await axios.put(`/questions/${editId}`, fd);
          toast.success("Question updated");
        } else {
          await axios.post("/questions", fd);
          toast.success("Question created");
        }
      } else {
        /* ---------- Non-MATH ---------- */
        if (editId) {
          await axios.put(`/questions/${editId}`, basePayload);
          toast.success("Question updated");
        } else {
          await axios.post("/questions", basePayload);
          toast.success("Question created");
        }
      }

      resetNormal();
      fetchQuestions();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to submit"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Submit Passage ---------- */
  const handleSubmitPassage = async () => {
    try {
      setSubmitting(true);

      const payload = {
        testId,
        type: "PASSAGE",
        difficulty: passage.difficulty,
        passageText: passage.passageText,
        passageQuestions: passage.passageQuestions,
      };

      if (editId) {
        await axios.put(`/questions/${editId}`, payload);
        toast.success("Passage updated");
      } else {
        await axios.post("/questions", payload);
        toast.success("Passage created");
      }

      resetPassage();
      fetchQuestions();
      setMode("NORMAL");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to submit passage"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Handle Delete ---------- */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`/questions/${deleteId}`);
      toast.success("Question deleted");
      setDeleteId(null);
      fetchQuestions();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- Handle Edit ---------- */
  const handleEdit = (question) => {
    setEditId(question._id);

    if (question.type === "PASSAGE") {
      setMode("PASSAGE");
      setPassage({
        difficulty: question.difficulty,
        passageText: question.passageText,
        passageQuestions: question.passageQuestions,
      });
    } else {
      setMode("NORMAL");
      setForm({
        type: question.type,
        difficulty: question.difficulty,
        questionText: question.questionText || {
          english: "",
          hindi: "",
        },
        assertion: question.assertion || {
          english: "",
          hindi: "",
        },
        reason: question.reason || {
          english: "",
          hindi: "",
        },
        options: question.options,
        correctAnswers: question.correctAnswers || [],
        marks: question.marks,
        negativeMarks: question.negativeMarks,
        explanation: question.explanation || {
          english: "",
          hindi: "",
        },
      });
    }
  };

  /* 
    ⛔ STEP 3 (Global State) yahan add hoga
    ⛔ STEP 4 (Utility Functions) yahan add hoga
    ⛔ STEP 5 (API Functions) yahan add hoga
  */

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6">
          

 {/* ---------------- HEADER ---------------- */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
  {/* LEFT */}
  <div className="min-w-0">
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
      <LayoutDashboard size={14} />
      Admin
      <ChevronRight size={14} className="text-slate-300" />
      <ClipboardList size={14} />
      Questions
    </div>

    <h1 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
      Manage <span className="text-blue-600">Questions</span>
    </h1>

    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-semibold">
      MCQ • MSQ • Math • Assertion-Reason • Passage
    </p>
  </div>

  {/* RIGHT */}
  <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
    <Link
      to="/admin/tests"
      className="rounded-2xl px-3 sm:px-4 py-2 bg-white border border-slate-200 text-slate-700 font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-slate-50"
    >
      Back to Tests
    </Link>

    <div className="rounded-2xl px-3 sm:px-4 py-2 bg-slate-900 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-widest inline-flex items-center gap-2">
      <Sparkles size={14} />
      <span className="hidden sm:inline">Test ID:</span>
      <span className="font-black">{String(testId || "").slice(0, 8)}…</span>
    </div>
  </div>
</div>



{/* ---------------- CONTROLS (Mode + Language) ---------------- */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  {/* Mode Switch */}
  <div className="inline-flex p-1 rounded-2xl bg-slate-50 border border-slate-200">
    <button
      type="button"
      onClick={() => setMode("NORMAL")}
      className={[
        "px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] transition-all",
        mode === "NORMAL"
          ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
          : "text-slate-600 hover:bg-white",
      ].join(" ")}
    >
      Normal
    </button>

    <button
      type="button"
      onClick={() => setMode("PASSAGE")}
      className={[
        "px-5 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] transition-all",
        mode === "PASSAGE"
          ? "bg-blue-600 text-white shadow-lg shadow-blue-100"
          : "text-slate-600 hover:bg-white",
      ].join(" ")}
    >
      Passage
    </button>
  </div>

  {/* Language Toggle */}
  <div className="flex items-center gap-3">
    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
      Language
    </div>

    <div className="inline-flex p-1 rounded-2xl bg-slate-50 border border-slate-200">
      <button
        type="button"
        onClick={() => setLangMode("EN")}
        className={[
          "px-4 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] transition-all",
          langMode === "EN"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:bg-white",
        ].join(" ")}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLangMode("HI")}
        className={[
          "px-4 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] transition-all",
          langMode === "HI"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:bg-white",
        ].join(" ")}
      >
        HI
      </button>
    </div>
  </div>
</div>


{/* ---------------- FORM SECTION  ---------------- */}
<div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
  {mode === "NORMAL" ? (
    <>
      {/* Type + Difficulty + Marks + Negative */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Question type
          </div>
        <select
  value={form.type}
  onChange={(e) => {
    const nextType = e.target.value;

    setForm((p) => {
      // ✅ only AR has fixed defaults
      const nextOptions =
        nextType === "ASSERTION_REASON"
          ? getARDefaultOptions()
          : p.type === "ASSERTION_REASON"
          ? emptyOptions() // ✅ leaving AR => reset to normal A/B/C/D empty
          : p.options;     // ✅ switching between MCQ/MSQ/MATH => keep user's typed options

      const nextCorrect =
        nextType === "MSQ"
          ? p.correctAnswers
          : (p.correctAnswers?.[0] ? [p.correctAnswers[0]] : []);

      return {
        ...p,
        type: nextType,
        options: nextOptions,
        correctAnswers: nextCorrect,
      };
    });
  }}
  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
>
  {QUESTION_TYPES.filter((t) => t !== "PASSAGE").map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>

        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Difficulty
          </div>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          >
            {DIFFICULTY_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Marks
          </div>
          <input
            type="number"
            value={form.marks}
            onChange={(e) => setForm({ ...form, marks: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Negative marks
          </div>
          <input
            type="number"
            step="0.01"
            value={form.negativeMarks}
            onChange={(e) => setForm({ ...form, negativeMarks: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Question / Assertion-Reason */}
      {form.type === "ASSERTION_REASON" ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Assertion
            </div>
            <textarea
              rows={4}
              placeholder="Type assertion…"
              value={form.assertion[langMode === "EN" ? "english" : "hindi"]}
              onChange={(e) =>
                setForm({
                  ...form,
                  assertion: {
                    ...form.assertion,
                    [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Reason
            </div>
            <textarea
              rows={4}
              placeholder="Type reason…"
              value={form.reason[langMode === "EN" ? "english" : "hindi"]}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason: {
                    ...form.reason,
                    [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Question
          </div>
          <textarea
            rows={4}
            placeholder="Type question…"
            value={form.questionText[langMode === "EN" ? "english" : "hindi"]}
            onChange={(e) =>
              setForm({
                ...form,
                questionText: {
                  ...form.questionText,
                  [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                },
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
      )}

      {/* ✅ Options (MATH bhi MCQ jaisa hi, BUT no default auto text for MATH) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-black text-slate-900">Options</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              {form.type === "MSQ"
                ? "Select multiple correct answers."
                : "Select exactly one correct answer."}
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            A / B / C / D
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {form.options.map((opt, i) => {
            const checked = form.correctAnswers.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={[
                  "flex items-center gap-3 rounded-2xl border p-3 bg-white",
                  checked ? "border-blue-200 ring-4 ring-blue-50" : "border-slate-200",
                ].join(" ")}
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700">
                  {opt.id}
                </div>

                <input
                  type={form.type === "MSQ" ? "checkbox" : "radio"} // ✅ MATH radio(single)
                  className="h-4 w-4 accent-blue-600"
                  checked={checked}
                  onChange={() => toggleCorrect(opt.id)}
                />

                <input
                  placeholder={`Option ${opt.id} (${langMode})`}
                  value={opt.text[langMode === "EN" ? "english" : "hindi"]}
                  onChange={(e) =>
                    handleOptionChange(
                      i,
                      langMode === "EN" ? "english" : "hindi",
                      e.target.value
                    )
                  }
                  // ✅ only AR is locked; MATH stays editable (no defaults)
                  readOnly={form.type === "ASSERTION_REASON"}
                  className={[
                    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300",
                    form.type === "ASSERTION_REASON"
                      ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                      : "bg-white text-slate-800",
                  ].join(" ")}
                />
              </div>
            );
          })}
        </div>

        {form.type === "ASSERTION_REASON" && (
          <p className="mt-3 text-xs text-slate-500 font-semibold">
            AR options auto-filled. बस सही option select करो.
          </p>
        )}
      </div>

      {/* MATH Image */}
      {form.type === "MATH" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-black text-slate-900">
            Math Image <span className="text-slate-400">(optional)</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Upload image if question is image-based.
          </p>

          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {imageFile && (
            <div className="mt-3 text-xs font-semibold text-slate-600">
              Selected: <span className="font-black">{imageFile.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmitNormal}
        disabled={submitting}
        className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Saving..." : editId ? "Update Question" : "Create Question"}
      </button>
    </>
  ) : (
    <>
      {/* Passage Builder (unchanged) */}
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          Passage text
        </div>
        <textarea
          rows={6}
          placeholder="Type passage…"
          value={passage.passageText[langMode === "EN" ? "english" : "hindi"]}
          onChange={(e) =>
            setPassage({
              ...passage,
              passageText: {
                ...passage.passageText,
                [langMode === "EN" ? "english" : "hindi"]: e.target.value,
              },
            })
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
        />
      </div>

      <button
        type="button"
        onClick={addPassageQuestion}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 hover:bg-black transition active:scale-[0.99]"
      >
        + Add Sub Question
      </button>

      <div className="space-y-4">
        {passage.passageQuestions.map((q, index) => (
          <div
            key={index}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">
                Sub Question #{index + 1}
              </div>
              <button
                type="button"
                onClick={() => removePassageQuestion(index)}
                className="rounded-xl px-3 py-2 font-black text-[10px] uppercase tracking-[0.22em] text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
              >
                Remove
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Type sub question…"
              value={q.questionText[langMode === "EN" ? "english" : "hindi"]}
              onChange={(e) =>
                updatePassageQuestion(index, "questionText", {
                  ...q.questionText,
                  [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />

            {/* SubQ Options (always visible) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-slate-900">Options</div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  A / B / C / D
                </div>
              </div>

              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const checked = q.correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={[
                        "flex items-center gap-3 rounded-2xl border p-3 bg-white",
                        checked ? "border-blue-200 ring-4 ring-blue-50" : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700">
                        {opt.id}
                      </div>

                      <input
                        type={q.type === "MSQ" ? "checkbox" : "radio"}
                        className="h-4 w-4 accent-blue-600"
                        checked={checked}
                        onChange={() => togglePassageCorrect(index, opt.id)}
                      />

                      <input
                        placeholder={`Option ${opt.id} (${langMode})`}
                        value={opt.text[langMode === "EN" ? "english" : "hindi"]}
                        onChange={(e) =>
                          updatePassageOption(
                            index,
                            i,
                            langMode === "EN" ? "english" : "hindi",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmitPassage}
        disabled={submitting}
        className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Saving..." : editId ? "Update Passage" : "Create Passage"}
      </button>
    </>
  )}
</div>


{/* ---------------- QUESTIONS LIBRARY (ENHANCED UI + ICONS + OPTIONS PREVIEW) ---------------- */}
<div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-6 sm:p-8">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
        <ClipboardListIcon className="text-blue-700" size={18} />
      </div>

      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Questions Library
        </h2>
        <p className="text-sm text-slate-500 font-semibold mt-1">
          Edit, preview options, or delete existing questions for this test.
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={fetchQuestions}
        className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 font-black text-[11px] uppercase tracking-[0.22em] text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition"
      >
        <Sparkles size={14} className="text-blue-600" />
        Refresh
      </button>
    </div>
  </div>
  <div className="mt-6">
    {loading ? (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
        <div className="inline-flex items-center gap-3 text-slate-600 font-black">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          Loading questions…
        </div>
      </div>
    ) : questions.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <p className="text-slate-800 font-black text-sm">No questions found</p>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Create your first question using the form above.
        </p>
      </div>
    ) : (
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        {questions.map((q) => {
const isMath = q.type === "MATH";

const preview =
  q.type === "PASSAGE"
    ? q.passageText?.english || q.passageText?.hindi || "—"
    : q.type === "ASSERTION_REASON"
    ? (q.assertion?.english || q.assertion?.hindi || "—") +
      "  |  " +
      (q.reason?.english || q.reason?.hindi || "—")
    : isMath
    ? (q.questionText?.english || q.questionText?.hindi || "").trim() ||
      (q.image ? "Math question (image)" : "Math question")
    : (q.questionText?.english || q.questionText?.hindi || "—");

          const isObjective =
            q.type === "MCQ" || q.type === "MSQ" || q.type === "ASSERTION_REASON" || q.type === "MATH";

          const opts = Array.isArray(q.options) ? q.options : [];
          const correct = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];

          return (
            <div
              key={q._id}
              className="p-4 sm:p-5 bg-white hover:bg-slate-50 transition flex flex-col gap-4"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.22em]">
                      <FileText size={14} />
                      {q.type}
                    </span>

                    {q.difficulty && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.22em]">
                        <LayoutDashboard size={14} />
                        {q.difficulty}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-[0.22em]">
                      <Sparkles size={14} className="text-blue-600" />
                      Marks {q.marks ?? "—"} • Neg {q.negativeMarks ?? "—"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-800 line-clamp-2">
                    {preview}
                  </p>

                  {/* Options Preview */}
                  {isObjective && opts.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                          Options
                        </div>

                        {correct.length > 0 && (
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                            Correct: {correct.join(", ")}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 grid sm:grid-cols-2 gap-3">
                        {opts.slice(0, 4).map((o) => {
                          const text =
                            o?.text?.english || o?.text?.hindi || o?.text || "—";
                          const isCorrect = correct.includes(o.id);

                          return (
                            <div
                              key={o.id}
                              className={[
                                "flex items-start gap-3 rounded-2xl border p-3",
                                isCorrect
                                  ? "border-emerald-200 bg-emerald-50"
                                  : "border-slate-200 bg-slate-50",
                              ].join(" ")}
                            >
                              <div
                                className={[
                                  "w-9 h-9 rounded-2xl border flex items-center justify-center font-black text-[12px]",
                                  isCorrect
                                    ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                                    : "bg-white border-slate-200 text-slate-700",
                                ].join(" ")}
                              >
                                {o.id}
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                                  {text}
                                </div>
                                {isCorrect && (
                                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                                    ✓ correct
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(q)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-black text-[10px] uppercase tracking-[0.22em] text-blue-700 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteId(q._id)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 font-black text-[10px] uppercase tracking-[0.22em] text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
</div>



               </div>

        {/* 
          ⛔ STEP 7 (Confirm Dialog)
        */}

        {/* =========================================================
   7️⃣ CONFIRM DELETE DIALOG
========================================================= */}

<ConfirmDialog
  open={Boolean(deleteId)}
  title="Delete Question?"
  description="This action cannot be undone. The question and its image (if any) will be permanently deleted."
  confirmText="Yes, Delete"
  cancelText="Cancel"
  danger
  loading={deleteLoading}
  onConfirm={handleDelete}
  onCancel={() => {
    if (!deleteLoading) setDeleteId(null);
  }}
/>

      </main>
    </div>
  );
}

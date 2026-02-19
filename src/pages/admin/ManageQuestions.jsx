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
  LayoutDashboard,
  Sparkles,
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

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function ManageQuestions() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const isDesktop = useMediaQuery("(min-width: 1280px)");

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
  const [dualLang, setDualLang] = useState(true);
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
          

          {/* =========================================================
   6️⃣ RENDER SECTIONS
========================================================= */}

{/* ---------------- HEADER ---------------- */}
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
  <div>
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
      <LayoutDashboard size={14} />
      Admin
      <ChevronRight size={14} className="text-slate-300" />
      <ClipboardList size={14} />
      Questions
    </div>

    <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
      Manage <span className="text-blue-600">Questions</span>
    </h1>

    <p className="mt-2 text-sm text-slate-500">
      MCQ, MSQ, Math, Assertion-Reason, Passage based questions.
    </p>
  </div>

  <div className="flex items-center gap-3">
    <Link
      to="/admin/tests"
      className="rounded-2xl px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50"
    >
      Back to Tests
    </Link>

    <div className="rounded-2xl px-4 py-2.5 bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest inline-flex items-center gap-2">
      <Sparkles size={14} />
      Test ID: {String(testId || "").slice(0, 8)}…
    </div>
  </div>
</div>


{/* ---------------- CONTROLS (Mode + Language) ---------------- */}
<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">

  {/* Mode Switch */}
  <div className="flex gap-2">
    <button
      onClick={() => setMode("NORMAL")}
      className={`px-4 py-2 rounded-xl font-bold text-xs ${
        mode === "NORMAL"
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      Normal
    </button>

    <button
      onClick={() => setMode("PASSAGE")}
      className={`px-4 py-2 rounded-xl font-bold text-xs ${
        mode === "PASSAGE"
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      Passage
    </button>
  </div>

  {/* Language Toggle */}
  <div className="flex gap-2 items-center">
    <button
      onClick={() => setLangMode("EN")}
      className={`px-3 py-1 rounded-lg text-xs font-bold ${
        langMode === "EN" ? "bg-blue-600 text-white" : "bg-slate-100"
      }`}
    >
      EN
    </button>
    <button
      onClick={() => setLangMode("HI")}
      className={`px-3 py-1 rounded-lg text-xs font-bold ${
        langMode === "HI" ? "bg-blue-600 text-white" : "bg-slate-100"
      }`}
    >
      HI
    </button>
  </div>
</div>


{/* ---------------- FORM SECTION ---------------- */}
<div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 space-y-6">

  {mode === "NORMAL" ? (
    <>
      {/* Type + Difficulty */}
      <div className="grid md:grid-cols-2 gap-4">
        <select
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value })
          }
          className="border rounded-xl p-3"
        >
          {QUESTION_TYPES.map((t) =>
            t !== "PASSAGE" ? (
              <option key={t} value={t}>{t}</option>
            ) : null
          )}
        </select>

        <select
          value={form.difficulty}
          onChange={(e) =>
            setForm({ ...form, difficulty: e.target.value })
          }
          className="border rounded-xl p-3"
        >
          {DIFFICULTY_LEVELS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Question / Assertion */}
      {form.type === "ASSERTION_REASON" ? (
        <>
          <textarea
            placeholder="Assertion"
            value={form.assertion[langMode === "EN" ? "english" : "hindi"]}
            onChange={(e) =>
              setForm({
                ...form,
                assertion: {
                  ...form.assertion,
                  [langMode === "EN" ? "english" : "hindi"]:
                    e.target.value,
                },
              })
            }
            className="w-full border rounded-xl p-3"
          />
          <textarea
            placeholder="Reason"
            value={form.reason[langMode === "EN" ? "english" : "hindi"]}
            onChange={(e) =>
              setForm({
                ...form,
                reason: {
                  ...form.reason,
                  [langMode === "EN" ? "english" : "hindi"]:
                    e.target.value,
                },
              })
            }
            className="w-full border rounded-xl p-3"
          />
        </>
      ) : (
        <textarea
          placeholder="Question"
          value={form.questionText[langMode === "EN" ? "english" : "hindi"]}
          onChange={(e) =>
            setForm({
              ...form,
              questionText: {
                ...form.questionText,
                [langMode === "EN" ? "english" : "hindi"]:
                  e.target.value,
              },
            })
          }
          className="w-full border rounded-xl p-3"
        />
      )}

      {/* Options */}
      {form.options.map((opt, i) => (
        <div key={opt.id} className="flex gap-3 items-center">
          <input
            type={form.type === "MSQ" ? "checkbox" : "radio"}
            checked={form.correctAnswers.includes(opt.id)}
            onChange={() => toggleCorrect(opt.id)}
          />
          <input
            placeholder={`Option ${opt.id}`}
            value={opt.text[langMode === "EN" ? "english" : "hindi"]}
            onChange={(e) =>
              handleOptionChange(
                i,
                langMode === "EN" ? "english" : "hindi",
                e.target.value
              )
            }
            className="flex-1 border rounded-xl p-3"
          />
        </div>
      ))}

      {/* MATH Image */}
      {form.type === "MATH" && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="border rounded-xl p-3"
        />
      )}

      {/* Marks */}
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Marks"
          value={form.marks}
          onChange={(e) =>
            setForm({ ...form, marks: e.target.value })
          }
          className="border rounded-xl p-3"
        />
        <input
          type="number"
          placeholder="Negative Marks"
          value={form.negativeMarks}
          onChange={(e) =>
            setForm({ ...form, negativeMarks: e.target.value })
          }
          className="border rounded-xl p-3"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmitNormal}
        disabled={submitting}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
      >
        {editId ? "Update Question" : "Create Question"}
      </button>
    </>
  ) : (
    <>
      {/* Passage Builder */}
      <textarea
        placeholder="Passage Text"
        value={passage.passageText[langMode === "EN" ? "english" : "hindi"]}
        onChange={(e) =>
          setPassage({
            ...passage,
            passageText: {
              ...passage.passageText,
              [langMode === "EN" ? "english" : "hindi"]:
                e.target.value,
            },
          })
        }
        className="w-full border rounded-xl p-3"
      />

      <button
        onClick={addPassageQuestion}
        className="bg-slate-900 text-white px-4 py-2 rounded-xl"
      >
        Add Sub Question
      </button>

      {passage.passageQuestions.map((q, index) => (
        <div key={index} className="border rounded-xl p-4 space-y-3">
          <input
            placeholder="Sub Question"
            value={q.questionText[langMode === "EN" ? "english" : "hindi"]}
            onChange={(e) =>
              updatePassageQuestion(index, "questionText", {
                ...q.questionText,
                [langMode === "EN" ? "english" : "hindi"]:
                  e.target.value,
              })
            }
            className="w-full border rounded-lg p-2"
          />

          {q.options.map((opt, i) => (
            <div key={opt.id} className="flex gap-3 items-center">
              <input
                type={q.type === "MSQ" ? "checkbox" : "radio"}
                checked={q.correctAnswers.includes(opt.id)}
                onChange={() =>
                  togglePassageCorrect(index, opt.id)
                }
              />
              <input
                placeholder={`Option ${opt.id}`}
                value={opt.text[langMode === "EN" ? "english" : "hindi"]}
                onChange={(e) =>
                  updatePassageOption(
                    index,
                    i,
                    langMode === "EN" ? "english" : "hindi",
                    e.target.value
                  )
                }
                className="flex-1 border rounded-lg p-2"
              />
            </div>
          ))}

          <button
            onClick={() => removePassageQuestion(index)}
            className="text-red-600 text-xs font-bold"
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={handleSubmitPassage}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl"
      >
        {editId ? "Update Passage" : "Create Passage"}
      </button>
    </>
  )}
</div>


{/* ---------------- QUESTIONS TABLE ---------------- */}
<div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-4 space-y-3">
  <h2 className="text-lg font-black text-slate-900">
    Questions Library
  </h2>

  {loading ? (
    <p>Loading...</p>
  ) : (
    questions.map((q) => (
      <div
        key={q._id}
        className="border rounded-xl p-3 flex justify-between items-center"
      >
        <div>
          <p className="font-bold">{q.type}</p>
          <p className="text-sm text-slate-500">
            {q.type === "PASSAGE"
              ? q.passageText?.english
              : q.questionText?.english}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(q)}
            className="text-blue-600 text-xs font-bold"
          >
            Edit
          </button>
          <button
            onClick={() => setDeleteId(q._id)}
            className="text-red-600 text-xs font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    ))
  )}
</div>

          {/* 
            ⛔ STEP 6 (Render Sections)
            Header
            Controls
            Forms
            Table
          */}

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

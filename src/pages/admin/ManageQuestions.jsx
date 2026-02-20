// src/pages/admin/ManageQuestions.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "../../services/axiosInstance";
import toast from "react-hot-toast";

import AdminSidebar from "../../components/admin/AdminSidebar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import PageHeader from "./questions/PageHeader";
import QuestionForm from "./questions/QuestionForm";
import QuestionsLibrary from "./questions/QuestionLibrary";


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

  marks: 2,
  negativeMarks: 0.33,

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

  marks: 2,
  negativeMarks: 0.33,

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
const navigate = useNavigate();
const location = useLocation();

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
const handleDiscard = () => {
  setEditId(null);          // ✅ exit edit mode
  setMode("NORMAL");        // ✅ back to normal
  setForm(emptyNormalForm()); 
  setPassage(emptyPassageForm());
  setImageFile(null);

  // optional: scroll to top/form
  // window.scrollTo({ top: 0, behavior: "smooth" });

  toast.success("Changes discarded");
};

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
useEffect(() => {
  const qs = new URLSearchParams(location.search);
  const editQ = qs.get("editQ");
  if (!editQ) return;

  // questions load hone ke baad hi
  const found = questions.find((x) => x._id === editQ);
  if (!found) return;

  handleEdit(found); // ✅ form prefill + editId set

  // optional: URL clean (refresh loop/duplicate toast avoid)
  qs.delete("editQ");
  navigate({ search: qs.toString() }, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.search, questions]);


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
    // ✅ after setMode/setForm/setPassage
window.scrollTo({ top: 0, behavior: "smooth" });

  };


  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6">
          

 {/* -------- HEADER + LANG ---------- */}
<PageHeader
  testId={testId}
  mode={mode}
  setMode={setMode}
  langMode={langMode}
  setLangMode={setLangMode}
/>

{/* ---------------- FORM SECTION  ---------------- */}
<QuestionForm
  mode={mode}
  form={form}
  setForm={setForm}
  passage={passage}
  setPassage={setPassage}
  langMode={langMode}
  imageFile={imageFile}
  setImageFile={setImageFile}
  submitting={submitting}
  editId={editId}
  QUESTION_TYPES={QUESTION_TYPES}
  DIFFICULTY_LEVELS={DIFFICULTY_LEVELS}
  getARDefaultOptions={getARDefaultOptions}
  emptyOptions={emptyOptions}
  handleOptionChange={handleOptionChange}
  toggleCorrect={toggleCorrect}
  addPassageQuestion={addPassageQuestion}
  removePassageQuestion={removePassageQuestion}
  updatePassageQuestion={updatePassageQuestion}
  updatePassageOption={updatePassageOption}
  togglePassageCorrect={togglePassageCorrect}
  handleSubmitNormal={handleSubmitNormal}
  handleSubmitPassage={handleSubmitPassage}
  handleDiscard={handleDiscard}
/>

{/* Question Library */}
<QuestionsLibrary
  loading={loading}
  questions={questions}
  fetchQuestions={fetchQuestions}
  handleEdit={handleEdit}
  setDeleteId={setDeleteId}
  langMode={langMode}
/>

</div>

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

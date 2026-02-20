// src/pages/admin/ManageQuestions.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import LanguageControls from "./questions/components/LanguageControls";
import ModeSwitch from "./questions/components/ModeSwitch";
import NormalQuestionForm from "./questions/components/NormalQuestionForm";
import PassageForm from "./questions/components/PassageForm";
import QuestionsTable from "./questions/components/QuestionsTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useQuestions from "./questions/hooks/useQuestions";
import useQuestionForm from "./questions/hooks/useQuestionForm";

import {
  getIsHindiOnly,
  getBasePassageText,
  validatePassage,
} from "./questions/utils/questionHelpers";
import { emptyPassageSub } from "./questions/utils/questionTemplate";

import { AR_OPTIONS } from "./questions/utils/constants";

import {
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import axios from "../../services/axiosInstance";
import toast from "react-hot-toast";

/** ✅ FIXED useMediaQuery */
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
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

/** ✅ options objects builder (NO cross-fill; language safe) */
const toOptObjs4 = (enArr, hiArr) => {
  const en = Array.isArray(enArr) ? enArr : ["", "", "", ""];
  const hi = Array.isArray(hiArr) ? hiArr : ["", "", "", ""];
  return Array.from({ length: 4 }).map((_, i) => ({
    english: String(en[i] || "").trim(),
    hindi: String(hi[i] || "").trim(),
  }));
};

export default function ManageQuestions() {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isDesktop = useMediaQuery("(min-width: 1280px)");

  const [langMode, setLangMode] = useState("EN");
  const [dualLang, setDualLang] = useState(true);
  const isHindiOnly = getIsHindiOnly({ dualLang, langMode });

  const {
    form,
    setForm,
    editId,
    submitting,
    isMCQ,
    isMath,
    isAR,
    canSubmitNormal,
    setType,
    resetNormal,
    handleEdit,
    handleOptionChange,
    handleOptionHiChange,
    submitNormal,
  } = useQuestionForm({ testId, isHindiOnly });

  const { questions, loading, fetchQuestions } = useQuestions({
    testId,
    location,
    navigate,
    onAutoEdit: handleEdit,
  });

  const [mode, setMode] = useState("NORMAL"); // NORMAL | PASSAGE
  const [passageText, setPassageText] = useState("");
  const [passageTextHi, setPassageTextHi] = useState("");
  const [passageSubs, setPassageSubs] = useState([emptyPassageSub()]);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const resetPassage = useCallback(() => {
    setPassageText("");
    setPassageTextHi("");
    setPassageSubs([emptyPassageSub()]);
  }, []);

  const basePassageText = getBasePassageText({
    passageText,
    passageTextHi,
    isHindiOnly,
  });

  const passageValid = useMemo(
    () => validatePassage({ basePassageText, passageSubs, isHindiOnly }),
    [basePassageText, passageSubs, isHindiOnly]
  );

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/questions/${deleteId}`);
      await fetchQuestions();
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    if (deleteLoading) return;
    setDeleteId(null);
  };

  /** ✅ REAL Passage submit */
  const handleSubmitPassage = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!passageValid) {
        toast.error("Passage incomplete");
        return;
      }

      try {
        const passageEn = String(passageText || "").trim();
        const passageHi = String(passageTextHi || "").trim();

        // loop all sub questions => create one question per sub
        for (const s of passageSubs) {
          const marks = String(s.marks ?? "").trim() === "" ? 0 : Number(s.marks);
          const negativeMarks =
            String(s.negativeMarks ?? "").trim() === "" ? 0 : Number(s.negativeMarks);

          // base questionText (sub question)
          const qEn = String(s.questionText || "").trim();
          const qHi = String(s.questionTextHi || "").trim();

          let payload = null;

          // ✅ backend validation language (must match your updated controller)
          const metaLang = isHindiOnly ? "hindi" : "english";

          // ======= ASSERTION_REASON =======
          if (s.type === "ASSERTION_REASON") {
            const idx = Number(s.correctAnswerIndex);
            const correct = AR_OPTIONS[idx] || "";

            const aEn = String(s.assertionText || "").trim();
            const rEn = String(s.reasonText || "").trim();
            const aHi = String(s.assertionTextHi || "").trim();
            const rHi = String(s.reasonTextHi || "").trim();

payload = {
  testId,
  type: isMSQ ? "MSQ" : s.type === "MATH" ? "MATH" : "MCQ",
  marks,
  negativeMarks,
  lang: metaLang,

  // ✅ PROPER PASSAGE FIELD
  passage: {
    english: passageEn || "",
    hindi: passageHi || "",
  },

  // ✅ ONLY QUESTION TEXT HERE
  questionText: {
    english: qEn || "",
    hindi: qHi || "",
  },

  options,
  ...(isMSQ
    ? { correctAnswers: finalCorrects }
    : { correctAnswer }),

  allowImage: false,
};

          } else {
            // ======= MCQ / MATH / MSQ =======
            const options = toOptObjs4(s.options, s.optionsHi);

            // ✅ MSQ detection: either s.type === "MSQ" or old pattern (MCQ + isMSQ)
            const isMSQ = s.type === "MSQ" || Boolean(s.type === "MCQ" && s.isMSQ);

            if (isMSQ) {
              // ✅ NEW backend: type="MSQ" + correctAnswers[]
              const correctAnswers = Array.isArray(s.correctAnswers) ? s.correctAnswers : [];

              // validate answers against selected language options
              const optList = options
                .map((o) =>
                  String((metaLang === "hindi" ? o.hindi : o.english) || "").trim()
                )
                .filter(Boolean);

              const normalized = [
                ...new Set(
                  correctAnswers.map((x) => String(x || "").trim()).filter(Boolean)
                ),
              ];

              const finalCorrects = normalized.filter((x) => optList.includes(x));

              payload = {
                testId,
                type: "MSQ",
                marks,
                negativeMarks,
                lang: metaLang,
                questionText: {
                  english: `PASSAGE:\n${passageEn || passageHi}\n\nQ: ${qEn || ""}`,
                  hindi: `PASSAGE:\n${passageHi || passageEn}\n\nQ: ${qHi || ""}`,
                },
                options,
                correctAnswers: finalCorrects,
                allowImage: false,
              };
            } else {
              // normal MCQ/MATH single correct
              let correctAnswer = String(s.correctAnswer || "").trim();

              // if correct missing but HI correct selected => map by index (legacy safe)
              if (!correctAnswer) {
                const caHi = String(s.correctAnswerHi || "").trim();
                if (caHi) {
                  const hiArr = Array.isArray(s.optionsHi) ? s.optionsHi : [];
                  const enArr = Array.isArray(s.options) ? s.options : [];
                  const idx = hiArr.findIndex((x) => String(x || "").trim() === caHi);
                  if (idx >= 0) correctAnswer = String(enArr[idx] || "").trim();
                }
              }

              payload = {
                testId,
                type: s.type === "MATH" ? "MATH" : "MCQ",
                marks,
                negativeMarks,
                lang: metaLang,
                questionText: {
                  english: `PASSAGE:\n${passageEn || passageHi}\n\nQ: ${qEn || ""}`,
                  hindi: `PASSAGE:\n${passageHi || passageEn}\n\nQ: ${qHi || ""}`,
                },
                options,
                correctAnswer,
                allowImage: false,
              };
            }
          }

          // ⚠️ passage MATH image upload not handled here
          await axios.post("/questions", payload);
        }

        toast.success("Passage created");
        resetPassage();
        await fetchQuestions();
        setMode("NORMAL");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          "Failed to create passage";
        toast.error(msg);
      }
    },
    [passageValid, passageText, passageTextHi, passageSubs, testId, resetPassage, fetchQuestions, isHindiOnly]
  );

  const showSplit = isDesktop && (questions?.length || 0) > 10;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6">
          {/* Header */}
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
                MCQ, MSQ, Math (image+text), Assertion-Reason, Passage based questions.
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

          {/* Sticky controls */}
          <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-4 bg-[#F8FAFC]/90 backdrop-blur border-y border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7">
                <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm p-4">
                  <LanguageControls
                    langMode={langMode}
                    setLangMode={setLangMode}
                    dualLang={dualLang}
                    setDualLang={setDualLang}
                    isHindiOnly={isHindiOnly}
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-white rounded-[1.25rem] border border-slate-200 shadow-sm p-4">
                  <ModeSwitch
                    mode={mode}
                    setMode={setMode}
                    onToNormal={() => {}}
                    onToPassage={() => resetNormal()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Layout */}
          {showSplit ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <section className="xl:col-span-5">
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 220px)" }}>
                  <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40 shrink-0">
                    <h2 className="text-lg font-black text-slate-900">
                      {mode === "NORMAL"
                        ? editId
                          ? "Edit Question"
                          : "Add New Question"
                        : "Passage Builder"}
                    </h2>
                  </div>

                  <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                    {mode === "NORMAL" ? (
                      <NormalQuestionForm
                        form={form}
                        setForm={setForm}
                        editId={editId}
                        submitting={submitting}
                        dualLang={dualLang}
                        langMode={langMode}
                        isHindiOnly={isHindiOnly}
                        canSubmitNormal={canSubmitNormal}
                        onReset={resetNormal}
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitNormal({ fetchQuestions });
                        }}
                        onSetType={setType}
                        isMCQ={isMCQ}
                        isMSQ={form.type === "MSQ"} 
                        isMath={isMath}
                        isAR={isAR}
                        onOptionChange={handleOptionChange}
                        onOptionHiChange={handleOptionHiChange}
                      />
                    ) : (
                      <PassageForm
                        submitting={submitting}
                        dualLang={dualLang}
                        langMode={langMode}
                        isHindiOnly={isHindiOnly}
                        passageText={passageText}
                        setPassageText={setPassageText}
                        passageTextHi={passageTextHi}
                        setPassageTextHi={setPassageTextHi}
                        passageSubs={passageSubs}
                        setPassageSubs={setPassageSubs}
                        passageValid={passageValid}
                        onSubmit={handleSubmitPassage}
                        onReset={resetPassage}
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className="xl:col-span-7">
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-900">Questions Library</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Total:{" "}
                        <span className="font-black text-slate-900">{questions?.length || 0}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-2 sm:p-4 max-h-[calc(100vh-260px)] overflow-y-auto">
                    <QuestionsTable
                      loading={loading}
                      questions={questions}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 220px)" }}>
                  <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40 shrink-0">
                    <h2 className="text-lg font-black text-slate-900">
                      {mode === "NORMAL"
                        ? editId
                          ? "Edit Question"
                          : "Add New Question"
                        : "Passage Builder"}
                    </h2>
                  </div>

                  <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                    {mode === "NORMAL" ? (
                      <NormalQuestionForm
                        form={form}
                        setForm={setForm}
                        editId={editId}
                        submitting={submitting}
                        dualLang={dualLang}
                        langMode={langMode}
                        isHindiOnly={isHindiOnly}
                        canSubmitNormal={canSubmitNormal}
                        onReset={resetNormal}
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitNormal({ fetchQuestions });
                        }}
                        onSetType={setType}
                        isMCQ={isMCQ}
                        isMSQ={form.type === "MSQ"}
                        isMath={isMath}
                        isAR={isAR}
                        onOptionChange={handleOptionChange}
                        onOptionHiChange={handleOptionHiChange}
                      />
                    ) : (
                      <PassageForm
                        submitting={submitting}
                        dualLang={dualLang}
                        langMode={langMode}
                        isHindiOnly={isHindiOnly}
                        passageText={passageText}
                        setPassageText={setPassageText}
                        passageTextHi={passageTextHi}
                        setPassageTextHi={setPassageTextHi}
                        passageSubs={passageSubs}
                        setPassageSubs={setPassageSubs}
                        passageValid={passageValid}
                        onSubmit={handleSubmitPassage}
                        onReset={resetPassage}
                      />
                    )}
                  </div>
                </div>
              </section>

              <section>
                <div className="p-2 sm:p-4">
                  <QuestionsTable
                    loading={loading}
                    questions={questions}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteId(id)}
                  />
                </div>
              </section>
            </div>
          )}
        </div>

        <ConfirmDialog
          open={Boolean(deleteId)}
          title="Delete question?"
          description="This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          danger
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </main>
    </div>
  );
}

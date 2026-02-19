import { ClipboardListIcon, FileText, LayoutDashboard, Pencil, Sparkles, Trash2 } from "lucide-react";

function QuestionLibrary({
  loading,
  questions,
  fetchQuestions,
  handleEdit,
  setDeleteId,
  langMode,
}) {
  return (
    <>
    
    
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
    
    
    </>
  )
}

export default QuestionLibrary
import { ChevronRight, ClipboardList, LayoutDashboard, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

function PageHeader({ testId, mode, setMode, langMode, setLangMode }) {
  return (
    <>
    {/* header */}
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
    </>
  )
}

export default PageHeader
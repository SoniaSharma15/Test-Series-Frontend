import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, LayoutDashboard, Sparkles } from "lucide-react";

export default function HeaderBar({ testId }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
          <LayoutDashboard size={14} />
          Admin <ChevronRight size={14} className="text-slate-300" />
          <ClipboardList size={14} />
          Questions
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Manage <span className="text-blue-600">Questions</span>
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          MCQ, Math (image+text), Assertion-Reason, Passage based questions.
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
  );
}

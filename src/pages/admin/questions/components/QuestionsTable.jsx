// src/pages/admin/questions/components/QuestionsTable.jsx
import { useMemo, useState } from "react";
import { Pencil, Search, Trash2, X } from "lucide-react";

const textOf = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  return String(v.english || v.hindi || v.name || v.title || "").trim();
};

const optionText = (opt) => {
  if (!opt) return "";
  if (typeof opt === "string") return opt.trim();
  return String(opt.english || opt.hindi || "").trim();
};

export default function QuestionsTable({
  loading = false,
  questions = [],
  onEdit = () => {},
  onDelete = () => {},
}) {
  const list = Array.isArray(questions) ? questions : [];

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const qq = String(q || "").trim().toLowerCase();
    if (!qq) return list;

    return list.filter((x) => {
      const en = textOf(x?.questionText).toLowerCase();
      const hi = textOf(x?.meta?.hi?.questionText).toLowerCase();
      const type = String(x?.type || "").toLowerCase();
      return en.includes(qq) || hi.includes(qq) || type.includes(qq);
    });
  }, [list, q]);

  const Pill = ({ children }) => (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border border-slate-200 bg-white text-slate-700">
      {children}
    </span>
  );

  const IconBtn = ({ onClick, danger, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "inline-flex items-center justify-center rounded-lg border px-2.5 py-2 text-xs font-black uppercase tracking-widest",
        danger
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );

  const QuestionCell = ({ item }) => {
    const en = textOf(item?.questionText);
    const hi = textOf(item?.meta?.hi?.questionText);

    return (
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 whitespace-pre-wrap leading-snug">
          {en || <span className="text-slate-400">—</span>}
        </div>

        {hi ? (
          <div className="mt-1 text-[12px] font-semibold text-slate-600 whitespace-pre-wrap leading-snug">
            <span className="text-slate-400 font-black mr-1">HI</span>
            {hi}
          </div>
        ) : null}

        {/* options preview (safe) */}
        {Array.isArray(item?.options) && item.options.length ? (
          <div className="mt-2 text-[11px] font-semibold text-slate-500">
            Options:{" "}
            <span className="text-slate-700">
              {item.options.slice(0, 4).map(optionText).filter(Boolean).join(" | ")}
            </span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}{console.log(filtered)}
      <div className="px-3 sm:px-4 py-3 border-b border-slate-100 bg-slate-50/40 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[13px] sm:text-sm font-black text-slate-900">
              Questions
            </h3>
            <p className="text-[11px] font-semibold text-slate-500">
              {loading ? "Loading..." : `${filtered.length} items`}
            </p>
          </div>

          <Pill>{loading ? "Loading" : "Library"}</Pill>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search question / HI / type…"
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            disabled={loading}
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Clear"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="p-6 text-center text-slate-500 font-semibold">
          Loading questions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-center text-slate-500 font-semibold">
          No questions found
        </div>
      ) : (
        <>
          {/* ✅ Compact list */}
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div key={item._id} className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Pill>{item.type || "—"}</Pill>
                      <span className="text-[10px] font-black text-slate-500">
                        Marks: {item.marks ?? "—"}
                      </span>
                      <span className="text-[10px] font-black text-slate-500">
                        Neg: {item?.negativeMarks ?? 0}
                      </span>
                    </div>

                    <QuestionCell item={item} />
                  </div>

                  <div className="shrink-0 flex flex-col gap-2">
                    <IconBtn onClick={() => onEdit(item)} title="Edit">
                      <Pencil size={14} />
                    </IconBtn>
                    <IconBtn
                      onClick={() => onDelete(item._id)}
                      danger
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </IconBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

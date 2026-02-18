export default function LanguageControls({
  langMode,
  setLangMode,
  dualLang,
  setDualLang,
  isHindiOnly,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Segmented */}
      <div className="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setLangMode("EN")}
          className={`px-3 py-2 text-xs sm:text-sm font-black tracking-wide ${
            langMode === "EN"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLangMode("HI")}
          className={`px-3 py-2 text-xs sm:text-sm font-black tracking-wide ${
            langMode === "HI"
              ? "bg-blue-600 text-white"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          HI
        </button>
      </div>

      {/* Toggle */}
      <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={dualLang}
          onChange={(e) => setDualLang(e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Dual language
        <span className="text-[11px] text-slate-400 font-black">(EN+HI)</span>
      </label>

      {/* Badge */}
      {isHindiOnly ? (
        <span className="w-fit text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
          Hindi-only payload mode
        </span>
      ) : null}
    </div>
  );
}

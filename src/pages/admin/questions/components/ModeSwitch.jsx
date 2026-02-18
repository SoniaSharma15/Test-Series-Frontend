export default function ModeSwitch({ mode, setMode, onToNormal, onToPassage }) {
  return (
    <div className="inline-flex w-full sm:w-auto rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => {
          setMode("NORMAL");
          onToNormal?.();
        }}
        className={`flex-1 px-3 py-2 text-xs sm:text-sm font-black tracking-wide ${
          mode === "NORMAL"
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        Normal
      </button>

      <button
        type="button"
        onClick={() => {
          setMode("PASSAGE");
          onToPassage?.();
        }}
        className={`flex-1 px-3 py-2 text-xs sm:text-sm font-black tracking-wide ${
          mode === "PASSAGE"
            ? "bg-slate-900 text-white"
            : "text-slate-700 hover:bg-slate-50"
        }`}
      >
        Passage
      </button>
    </div>
  );
}

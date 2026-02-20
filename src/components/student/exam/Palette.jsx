export default function Palette({
  flatQuestions,
  currentIndex,
  setCurrentIndex,
  answersMap,
  visitedSet,
  reviewSet,
  handleSubmit,
}) {
  const isAnswered = (id) => {
    const ans = answersMap[id];
    return Array.isArray(ans) && ans.length > 0;
  };

  const attemptedCount = Object.keys(answersMap).length;

  const getStatusClasses = (q, idx) => {
    const answered = isAnswered(q.id);
    const visited = visitedSet.has(q.id);
    const review = reviewSet.has(q.id);
    const isCurrent = idx === currentIndex;

    let base = "h-10 rounded-lg font-bold text-xs transition-all ";

    let statusClass = "bg-slate-200 text-slate-500"; // Not visited (Gray)

    if (review && answered) {
      statusClass = "bg-yellow-400 text-white"; // Review + Answered
    } else if (review) {
      statusClass = "bg-purple-600 text-white"; // Review only
    } else if (answered) {
      statusClass = "bg-green-600 text-white"; // Answered
    } else if (visited) {
      statusClass = "bg-rose-500 text-white"; // Visited but not answered
    }

    const activeRing = isCurrent
      ? " ring-2 ring-blue-600 ring-offset-1"
      : "";

    return base + statusClass + activeRing;
  };

  return (
    <div className="w-[280px] md:w-80 bg-[#FBFCFE] border-l border-slate-200 flex flex-col">

      <div className="p-6 flex-1 overflow-y-auto">

        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
          Navigation
        </h3>

        {/* Question Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {flatQuestions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={getStatusClasses(q, idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-xs font-bold mb-2">
            Attempted: {attemptedCount} / {flatQuestions.length}
          </div>

          <div className="w-full bg-slate-100 h-2 rounded">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{
                width: `${
                  (attemptedCount / flatQuestions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 text-xs">
          <Legend color="bg-green-600" label="Answered" />
          <Legend color="bg-rose-500" label="Not Answered" />
          <Legend color="bg-purple-600" label="Marked for Review" />
          <Legend color="bg-yellow-400" label="Answered & Marked Review" />
          <Legend color="bg-slate-200" label="Not Visited" />
        </div>

      </div>

      <div className="p-6 border-t">
        <button
          onClick={() => handleSubmit(false)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-xs uppercase"
        >
          Final Submit
        </button>
      </div>
    </div>
  );
}

/* Legend Component */
function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-4 w-4 rounded ${color}`} />
      <span className="text-slate-600">{label}</span>
    </div>
  );
}

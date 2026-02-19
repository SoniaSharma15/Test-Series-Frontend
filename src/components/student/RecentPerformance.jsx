export default function RecentPerformance({ lastScore }) {
  const percentage = lastScore ?? 0;

  // Dynamic feedback logic
  const getFeedback = (score) => {
    if (score >= 90) return { msg: "Excellent work! You're a pro.", color: "text-emerald-400" };
    if (score >= 75) return { msg: "Great job! Keep the momentum.", color: "text-blue-400" };
    if (score >= 50) return { msg: "Good effort! Aim higher next time.", color: "text-amber-400" };
    return { msg: "Keep practicing, you'll get there!", color: "text-rose-400" };
  };

  const feedback = getFeedback(percentage);

  return (
    <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-blue-900/20 group">
      {/* Decorative background flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Insight Report
            </h3>
          </div>

          <p className="text-slate-300 text-sm font-medium mb-1">Last Test Score</p>
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-black text-white tracking-tighter italic">
              {Math.round(percentage)}
            </span>
            <span className="text-2xl font-bold text-slate-500">%</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {/* Custom Progress Bar */}
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <p className={`text-xs font-bold ${feedback.color} italic tracking-wide`}>
              {feedback.msg}
            </p>
            <span className="text-lg">🚀</span>
          </div>
        </div>
      </div>

      {/* Subtle bottom-right accent icon */}
      <div className="absolute bottom-6 right-8 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
    </div>
  );
}
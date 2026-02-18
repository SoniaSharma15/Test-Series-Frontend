import React from "react";

export default function QuestionPanel({
  current = 0,
  totalQuestions = 0,
  currentQuestion,
  language = "english",
  selectedAnswer = null,
  selectedAnswers = [],
  onSelectOption,
  onPrevious,
  onNext,
  onSubmit,
  onToggleReview,
  onClear,
  isReviewed = false,
  hideHeader = false,
}) {
  if (!currentQuestion || typeof currentQuestion !== "object") {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 font-sans">
        Question not available
      </div>
    );
  }

  const type = currentQuestion?.type || "MCQ";
  const isMSQ = type === "MSQ";

  /* ========= SAFE TEXT GETTER ========= */
  const getText = (obj) => {
    if (!obj || typeof obj !== "object") return "";
    return obj?.[language] || obj?.english || obj?.hindi || "";
  };

  /* ========= OPTION CLICK ========= */
  const handleOptionClick = (opt) => {
    if (!opt) return;

    const optionText = opt?.english || opt?.hindi || "";
    if (!optionText) return;

    if (typeof onSelectOption === "function") {
      onSelectOption(optionText, isMSQ);
    }
  };

  /* ========= CHECK SELECTED ========= */
  const isOptionSelected = (opt) => {
    const optionText = opt?.english || opt?.hindi || "";
    if (!optionText) return false;

    if (isMSQ) {
      return Array.isArray(selectedAnswers)
        ? selectedAnswers.includes(optionText)
        : false;
    }
    return selectedAnswer === optionText;
  };

  const options = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options
    : [];

  const marks = Number(currentQuestion?.marks) || 0;
  const neg = Number(currentQuestion?.negativeMarks) || 0;

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-white border-l border-r border-slate-200 font-sans">
      {/* Updated Top Strip: Removed "Reading Comp." text */}
      {!hideHeader && (
        <div className="h-12 bg-blue-600 text-white flex items-center justify-between px-6 shadow-sm z-10">
          <div className="text-[13px] font-black tracking-widest uppercase flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded">QUESTION {current + 1}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/10 rounded-lg px-3 py-1 border border-white/10">
               <span className="text-[10px] font-black mr-2 opacity-70 uppercase">Marks:</span>
               <span className="text-[12px] font-black">+{marks}</span>
               {neg > 0 && (
                 <>
                   <span className="mx-2 opacity-30">|</span>
                   <span className="text-red-200 text-[12px] font-black">-{neg}</span>
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Question Text */}
          <h2 className="text-[20px] leading-relaxed font-bold text-slate-800">
            {getText(currentQuestion?.questionText) || "Question not available"}
          </h2>

          {/* Question Image */}
          {currentQuestion?.questionImage?.url ? (
            <div className="mt-8 flex justify-start">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
                <img
                  src={currentQuestion.questionImage.url}
                  alt="Question Visualization"
                  className="max-h-96 w-full object-contain rounded-xl"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            </div>
          ) : null}

          {/* Options Grid */}
          <div className="mt-10 space-y-4">
            {options.length > 0 ? (
              options.map((opt, i) => {
                const selected = isOptionSelected(opt);
                const label = getText(opt) || "Option not available";

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOptionClick(opt)}
                    className={[
                      "w-full text-left rounded-2xl border-2 px-6 py-4 transition-all duration-200 flex items-center gap-5",
                      selected
                        ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-slate-100 hover:border-blue-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* Visual Checkbox/Radio */}
                    <div className="shrink-0">
                      {isMSQ ? (
                        <div
                          className={[
                            "h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors",
                            selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
                          ].join(" ")}
                        >
                          {selected && (
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <div
                          className={[
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            selected ? "border-blue-600" : "border-slate-300",
                          ].join(" ")}
                        >
                          {selected && <div className="h-3 w-3 bg-blue-600 rounded-full" />}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-[16px] font-semibold text-slate-700 leading-relaxed">
                      <span className="inline-block w-6 text-slate-400 font-black">{String.fromCharCode(65 + i)}.</span>
                      {label}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-slate-400 italic">No options available for this question.</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="h-20 border-t border-slate-200 bg-white px-8 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onClear && onClear()}
            className="h-11 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>

          <button
            onClick={() => onToggleReview && onToggleReview()}
            className={`h-11 px-6 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
              isReviewed 
                ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
            }`}
          >
            {isReviewed ? 'Bookmarked' : 'Review'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            disabled={current === 0}
            onClick={onPrevious}
            className="h-11 px-6 rounded-xl border-2 border-slate-200 bg-white text-slate-600 font-black text-xs uppercase tracking-widest disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50"
          >
            Back
          </button>

          {current < totalQuestions - 1 ? (
            <button
              onClick={onNext}
              className="h-11 px-10 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
            >
              Save & Next
            </button>
          ) : (
            <button
              onClick={onSubmit}
              className="h-11 px-10 rounded-xl bg-rose-600 text-white font-black text-xs uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all active:scale-95"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

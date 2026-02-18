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
      <div className="flex-1 flex items-center justify-center text-slate-500">
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
    <div className="flex-1 min-w-0 flex flex-col bg-white border-l border-r border-slate-200">
      {/* Top strip like screenshot - hide when passage/multi-column layout */}
      {!hideHeader && (
        <div className="h-11 bg-blue-600 text-white flex items-center justify-between px-4 border-b border-blue-700">
          <div className="text-[12px] font-extrabold tracking-wide uppercase">
            Q{current + 1} | {currentQuestion?.sectionTitle || "Reading Comp."}
          </div>

          <div className="flex items-center gap-2">
            <div className="text-[11px] font-black bg-white/15 px-3 py-1 rounded-full">
              +{marks}
              {neg > 0 ? <span className="ml-2 text-red-200">- {neg}</span> : null}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Question */}
          <h2 className="text-[22px] leading-snug font-extrabold text-slate-900">
            {getText(currentQuestion?.questionText) || "Question not available"}
          </h2>

          {/* Image (if any) */}
          {currentQuestion?.questionImage?.url ? (
            <div className="mt-6 flex justify-center">
              <img
                src={currentQuestion.questionImage.url}
                alt="Question"
                className="max-h-80 object-contain rounded-xl shadow-sm border border-slate-200 p-2 bg-slate-50"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          ) : null}

          {/* Options */}
          <div className="mt-8 space-y-4">
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
                      "w-full text-left rounded-xl border px-5 py-4",
                      "transition flex items-center gap-4",
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {/* circle/checkbox */}
                    <span className="shrink-0">
                      {isMSQ ? (
                        <span
                          className={[
                            "h-5 w-5 rounded border flex items-center justify-center",
                            selected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white",
                          ].join(" ")}
                        >
                          {selected ? (
                            <span className="h-2.5 w-2.5 bg-white rounded-sm" />
                          ) : null}
                        </span>
                      ) : (
                        <span
                          className={[
                            "h-5 w-5 rounded-full border flex items-center justify-center",
                            selected
                              ? "border-blue-600"
                              : "border-slate-300",
                          ].join(" ")}
                        >
                          {selected ? (
                            <span className="h-2.5 w-2.5 bg-blue-600 rounded-full" />
                          ) : null}
                        </span>
                      )}
                    </span>

                    <span className="flex-1 text-[15px] font-semibold text-slate-800">
                      <span className="font-extrabold mr-2">
                        {i + 1}.
                      </span>
                      {label}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="text-slate-400">No options available</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions like screenshot */}
      <div className="h-16 border-t border-slate-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onClear && onClear()}
            className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 font-extrabold text-[12px]"
          >
            CLEAR
          </button>

          <button
            onClick={() => onToggleReview && onToggleReview()}
            className={`h-10 px-4 rounded-lg border font-extrabold text-[12px] ${isReviewed ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            {isReviewed ? 'REVIEWED' : 'REVIEW'}
          </button>

          <button
            disabled={current === 0}
            onClick={onPrevious}
            className="h-10 px-6 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-extrabold text-[12px] disabled:opacity-50"
          >
            PREVIOUS
          </button>
        </div>

        {current < totalQuestions - 1 ? (
          <button
            onClick={onNext}
            className="h-10 px-8 rounded-lg bg-emerald-700 text-white font-extrabold text-[12px] hover:bg-emerald-800"
          >
            SAVE & NEXT
          </button>
        ) : (
          <button
            onClick={onSubmit}
            className="h-10 px-8 rounded-lg bg-red-600 text-white font-extrabold text-[12px] hover:bg-red-700"
          >
            SUBMIT EXAM
          </button>
        )}
      </div>
    </div>
  );
}

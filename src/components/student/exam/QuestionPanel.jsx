const getTextByLanguage = (obj, lang) => {
  if (!obj) return "";

  if (typeof obj === "string") return obj;

  if (obj[lang]) return obj[lang];
  if (obj.english) return obj.english;
  if (obj.hindi) return obj.hindi;

  return "";
};

export default function QuestionPanel({
  currentQuestion,
  currentIndex,
  totalQuestions,
  answersMap,
  language,
  selectOption,
  clearAnswer,
  goToNext,
  goToPrevious,
  handleSubmit,
  toggleReview,
  reviewSet
}) {
  if (!currentQuestion) return null;

  const isLast = currentIndex === totalQuestions - 1;
  const isMSQ = currentQuestion.type === "MSQ";
  const isMarkedReview = reviewSet.has(currentQuestion.id);

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs sm:text-sm font-black text-slate-500 uppercase">
            Question {currentIndex + 1} / {totalQuestions}
          </span>

          <div className="text-xs sm:text-sm font-bold text-slate-600">
            +{currentQuestion.marks} | -{currentQuestion.negativeMarks}
          </div>
        </div>

        {/* ================= QUESTION ================= */}
        {currentQuestion.type !== "ASSERTION_REASON" && (
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 leading-relaxed mb-6 sm:mb-8">
            {getTextByLanguage(currentQuestion.questionText, language)}
          </h2>
        )}

        {currentQuestion.type === "ASSERTION_REASON" && (
          <div className="mb-8 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl text-sm sm:text-base">
              <strong>Assertion:</strong><br />
              {getTextByLanguage(currentQuestion.assertion, language)}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-sm sm:text-base">
              <strong>Reason:</strong><br />
              {getTextByLanguage(currentQuestion.reason, language)}
            </div>
          </div>
        )}

        {/* ================= OPTIONS ================= */}
        <div className="space-y-3 sm:space-y-4">
          {currentQuestion.options.map((opt) => {
            const selected =
              answersMap[currentQuestion.id]?.includes(opt.id);

            return (
              <button
                key={opt.id}
                onClick={() => selectOption(opt.id)}
                className={`
                  w-full text-left rounded-xl border-2
                  px-4 sm:px-6
                  py-4
                  min-h-[48px]
                  flex items-start gap-3
                  transition-all duration-200
                  ${selected
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300 active:scale-[0.99]"
                  }
                `}
              >
                <div
                  className={`
                    mt-1 h-5 w-5 flex-shrink-0 border
                    ${isMSQ ? "rounded" : "rounded-full"}
                    ${selected ? "bg-blue-600 border-blue-600" : "bg-white"}
                  `}
                />

                <div className="flex-1 font-semibold text-slate-700 text-sm sm:text-base leading-relaxed">
                  <span className="mr-2 font-black">{opt.id}.</span>
                  {getTextByLanguage(opt.text, language)}
                </div>
              </button>
            );
          })}
        </div>

        {/* ================= BOTTOM CONTROLS ================= */}
        <div className="mt-12 sticky bottom-4 z-10 px-4 sm:px-0">
          <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">

              {/* Left: Secondary Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto order-2 sm:order-1">
                <button
                  onClick={clearAnswer}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                >
                  Clear
                </button>

                <div className="w-px h-6 bg-slate-200 hidden sm:block mx-2" />

                <button
                  onClick={toggleReview}
                  className={`flex-[2] sm:flex-none px-5 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 border-2 ${isMarkedReview
                      ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100"
                      : "border-purple-100 text-purple-600 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                >
                  {isMarkedReview ? "✓ Reviewing" : "Mark for Review"}
                </button>
              </div>

              {/* Right: Primary Navigation */}
              <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={goToPrevious}
                  className="p-2.5 text-slate-400 hover:text-slate-600 disabled:opacity-20 transition-colors"
                  title="Previous Question"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {!isLast ? (
                  <button
                    onClick={goToNext}
                    className="flex-1 sm:flex-none bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-blue-600 shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    Save & Next
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="flex-1 sm:flex-none bg-rose-600 text-white px-8 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95"
                  >
                    Submit Exam
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
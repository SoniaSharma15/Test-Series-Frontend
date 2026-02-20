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
  toggleReview,        // ✅ ADD THIS
  reviewSet            // ✅ ADD THIS
}) {
  if (!currentQuestion) return null;

  const isLast = currentIndex === totalQuestions - 1;
  const isMSQ = currentQuestion.type === "MSQ";

  const isMarkedReview = reviewSet.has(currentQuestion.id);

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-black text-slate-500 uppercase">
            Question {currentIndex + 1}
          </span>

          <div className="text-xs font-bold text-slate-600">
            +{currentQuestion.marks} | -{currentQuestion.negativeMarks}
          </div>
        </div>

        {/* Question Text */}
        {currentQuestion.type !== "ASSERTION_REASON" && (
          <h2 className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
            {currentQuestion.questionText?.[language] ||
              currentQuestion.questionText?.english}
          </h2>
        )}

        {/* Assertion Reason */}
        {currentQuestion.type === "ASSERTION_REASON" && (
          <div className="mb-8 space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <strong>Assertion:</strong><br />
              {currentQuestion.assertion?.[language] ||
                currentQuestion.assertion?.english}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <strong>Reason:</strong><br />
              {currentQuestion.reason?.[language] ||
                currentQuestion.reason?.english}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((opt) => {
            const selected =
              answersMap[currentQuestion.id]?.includes(opt.id);

            return (
              <button
                key={opt.id}
                onClick={() => selectOption(opt.id)}
                className={`w-full text-left rounded-xl border-2 px-6 py-4 flex items-center gap-4 transition-all ${
                  selected
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className={`h-5 w-5 border ${isMSQ ? "rounded" : "rounded-full"} ${
                  selected ? "bg-blue-600" : "bg-white"
                }`} />

                <div className="flex-1 font-semibold text-slate-700">
                  <span className="mr-2 font-black">{opt.id}.</span>
                  {opt.text?.[language] || opt.text?.english}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Controls */}
        <div className="mt-10 flex justify-between items-center">

          {/* LEFT SIDE */}
          <div className="flex gap-4">

            <button
              onClick={clearAnswer}
              className="px-6 py-2 border rounded-lg"
            >
              Clear
            </button>

            {/* ✅ REVIEW BUTTON */}
            <button
              onClick={toggleReview}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isMarkedReview
                  ? "bg-purple-600 text-white"
                  : "border border-purple-600 text-purple-600"
              }`}
            >
              {isMarkedReview ? "Marked for Review" : "Mark for Review"}
            </button>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex gap-4">
            <button
              disabled={currentIndex === 0}
              onClick={goToPrevious}
              className="px-6 py-2 border rounded-lg"
            >
              Previous
            </button>

            {!isLast ? (
              <button
                onClick={goToNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save & Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className="px-6 py-2 bg-rose-600 text-white rounded-lg"
              >
                Submit Exam
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

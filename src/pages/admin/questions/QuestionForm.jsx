import React from 'react'

function QuestionForm(
    {
  mode,
  form,
  setForm,
  passage,
  setPassage,
  langMode,
  imageFile,
  setImageFile,
  submitting,
  editId,

  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  getARDefaultOptions,
  emptyOptions,

  handleOptionChange,
  toggleCorrect,

  addPassageQuestion,
  removePassageQuestion,
   updatePassageQuestion,
  updatePassageOption,
  togglePassageCorrect,

  handleDiscard,
  handleSubmitNormal,
  handleSubmitPassage,}
) {
  return (
    <>
    <div className="bg-white rounded-[1.75rem] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
  {mode === "NORMAL" ? (
    <>
      {/* Type + Difficulty + Marks + Negative */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Question type
          </div>
        <select
  value={form.type}
  onChange={(e) => {
    const nextType = e.target.value;

    setForm((p) => {
      // ✅ only AR has fixed defaults
      const nextOptions =
        nextType === "ASSERTION_REASON"
          ? getARDefaultOptions()
          : p.type === "ASSERTION_REASON"
          ? emptyOptions() // ✅ leaving AR => reset to normal A/B/C/D empty
          : p.options;     // ✅ switching between MCQ/MSQ/MATH => keep user's typed options

      const nextCorrect =
        nextType === "MSQ"
          ? p.correctAnswers
          : (p.correctAnswers?.[0] ? [p.correctAnswers[0]] : []);

      return {
        ...p,
        type: nextType,
        options: nextOptions,
        correctAnswers: nextCorrect,
      };
    });
  }}
  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
>
  {QUESTION_TYPES.filter((t) => t !== "PASSAGE").map((t) => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>

        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Difficulty
          </div>
          <select
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          >
            {DIFFICULTY_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Marks
          </div>
          <input
            type="number"
            value={form.marks}
            onChange={(e) => setForm({ ...form, marks: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Negative marks
          </div>
          <input
            type="number"
            step="0.01"
            value={form.negativeMarks}
            onChange={(e) => setForm({ ...form, negativeMarks: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Question / Assertion-Reason */}
      {form.type === "ASSERTION_REASON" ? (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Assertion
            </div>
            <textarea
              rows={4}
              placeholder="Type assertion…"
              value={form.assertion[langMode === "EN" ? "english" : "hindi"]}
              onChange={(e) =>
                setForm({
                  ...form,
                  assertion: {
                    ...form.assertion,
                    [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
              Reason
            </div>
            <textarea
              rows={4}
              placeholder="Type reason…"
              value={form.reason[langMode === "EN" ? "english" : "hindi"]}
              onChange={(e) =>
                setForm({
                  ...form,
                  reason: {
                    ...form.reason,
                    [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
            Question
          </div>
          <textarea
            rows={4}
            placeholder="Type question…"
            value={form.questionText[langMode === "EN" ? "english" : "hindi"]}
            onChange={(e) =>
              setForm({
                ...form,
                questionText: {
                  ...form.questionText,
                  [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                },
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
      )}

      {/* ✅ Options (MATH bhi MCQ jaisa hi, BUT no default auto text for MATH) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-black text-slate-900">Options</div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              {form.type === "MSQ"
                ? "Select multiple correct answers."
                : "Select exactly one correct answer."}
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            A / B / C / D
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {form.options.map((opt, i) => {
            const checked = form.correctAnswers.includes(opt.id);
            return (
              <div
                key={opt.id}
                className={[
                  "flex items-center gap-3 rounded-2xl border p-3 bg-white",
                  checked ? "border-blue-200 ring-4 ring-blue-50" : "border-slate-200",
                ].join(" ")}
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700">
                  {opt.id}
                </div>

                <input
                  type={form.type === "MSQ" ? "checkbox" : "radio"} // ✅ MATH radio(single)
                  className="h-4 w-4 accent-blue-600"
                  checked={checked}
                  onChange={() => toggleCorrect(opt.id)}
                />

                <input
                  placeholder={`Option ${opt.id} (${langMode})`}
                  value={opt.text[langMode === "EN" ? "english" : "hindi"]}
                  onChange={(e) =>
                    handleOptionChange(
                      i,
                      langMode === "EN" ? "english" : "hindi",
                      e.target.value
                    )
                  }
                  // ✅ only AR is locked; MATH stays editable (no defaults)
                  readOnly={form.type === "ASSERTION_REASON"}
                  className={[
                    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300",
                    form.type === "ASSERTION_REASON"
                      ? "bg-slate-50 text-slate-600 cursor-not-allowed"
                      : "bg-white text-slate-800",
                  ].join(" ")}
                />
              </div>
            );
          })}
        </div>

        {form.type === "ASSERTION_REASON" && (
          <p className="mt-3 text-xs text-slate-500 font-semibold">
            AR options auto-filled. बस सही option select करो.
          </p>
        )}
      </div>

      {/* MATH Image */}
      {form.type === "MATH" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="text-sm font-black text-slate-900">
            Math Image <span className="text-slate-400">(optional)</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Upload image if question is image-based.
          </p>

          <div className="mt-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {imageFile && (
            <div className="mt-3 text-xs font-semibold text-slate-600">
              Selected: <span className="font-black">{imageFile.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      {/* <button
        type="button"
        onClick={handleSubmitNormal}
        disabled={submitting}
        className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Saving..." : editId ? "Update Question" : "Create Question"}
      </button> */}
      <div className="flex flex-col sm:flex-row gap-5">
  <button
    type="button"
    onClick={handleDiscard}
    className="w-full sm:w-auto rounded-2xl bg-white border border-slate-200 px-5 py-3 font-black text-[11px] uppercase tracking-[0.22em] text-slate-700 hover:bg-slate-50 active:scale-[0.99] transition"
  >
    Discard
  </button>

  <button
    type="button"
    onClick={handleSubmitNormal}
    disabled={submitting}
    className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {submitting ? "Saving..." : editId ? "Update Question" : "Create Question"}
  </button>
</div>
    </>
  ) : (
    <>
      {/* Passage Builder (unchanged) */}
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          Passage text
        </div>
        <textarea
          rows={6}
          placeholder="Type passage…"
          value={passage.passageText[langMode === "EN" ? "english" : "hindi"]}
          onChange={(e) =>
            setPassage({
              ...passage,
              passageText: {
                ...passage.passageText,
                [langMode === "EN" ? "english" : "hindi"]: e.target.value,
              },
            })
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
        />
      </div>

      <button
        type="button"
        onClick={addPassageQuestion}
        className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-4 py-2.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 hover:bg-black transition active:scale-[0.99]"
      >
        + Add Sub Question
      </button>

      <div className="space-y-4">
        {passage.passageQuestions.map((q, index) => (
          <div
            key={index}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">
                Sub Question #{index + 1}
              </div>
              <button
                type="button"
                onClick={() => removePassageQuestion(index)}
                className="rounded-xl px-3 py-2 font-black text-[10px] uppercase tracking-[0.22em] text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
              >
                Remove
              </button>
            </div>

            <textarea
              rows={3}
              placeholder="Type sub question…"
              value={q.questionText[langMode === "EN" ? "english" : "hindi"]}
              onChange={(e) =>
                updatePassageQuestion(index, "questionText", {
                  ...q.questionText,
                  [langMode === "EN" ? "english" : "hindi"]: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />

            {/* SubQ Options (always visible) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-slate-900">Options</div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  A / B / C / D
                </div>
              </div>

              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const checked = q.correctAnswers.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={[
                        "flex items-center gap-3 rounded-2xl border p-3 bg-white",
                        checked ? "border-blue-200 ring-4 ring-blue-50" : "border-slate-200",
                      ].join(" ")}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-black text-blue-700">
                        {opt.id}
                      </div>

                      <input
                        type={q.type === "MSQ" ? "checkbox" : "radio"}
                        className="h-4 w-4 accent-blue-600"
                        checked={checked}
                        onChange={() => togglePassageCorrect(index, opt.id)}
                      />

                      <input
                        placeholder={`Option ${opt.id} (${langMode})`}
                        value={opt.text[langMode === "EN" ? "english" : "hindi"]}
                        onChange={(e) =>
                          updatePassageOption(
                            index,
                            i,
                            langMode === "EN" ? "english" : "hindi",
                            e.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmitPassage}
        disabled={submitting}
        className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Saving..." : editId ? "Update Passage" : "Create Passage"}
      </button>
    </>
  )}
</div>
    </>
  )
}

export default QuestionForm
import { AR_OPTIONS } from "../utils/constants";

export default function NormalQuestionForm({
  form,
  setForm,
  editId,
  submitting,
  dualLang,
  langMode,
  isHindiOnly,
  canSubmitNormal,
  onReset,
  onSubmit,
  onSetType,
  isMCQ,
  isMSQ,
  isMath,
  isAR,
  onOptionChange,
  onOptionHiChange,
}) {
  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 " +
    "px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60";

  const selectCls = inputCls + " pr-9";

  const labelCls =
    "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";

  const cardCls = "rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3";

  const softCardCls =
    "rounded-xl border border-blue-100 bg-blue-50/40 p-2.5 sm:p-3";

  const textareaRows = 2;

  const correctAnswers = Array.isArray(form?.correctAnswers)
    ? form.correctAnswers
    : [];

  // ✅ MSQ selection language: backend lang-based validation
  const msqLang = isHindiOnly || langMode === "HI" ? "hindi" : "english";

  const toggleCorrectAnswer = (optText) => {
    const v = String(optText || "").trim();
    if (!v) return;

    setForm((p) => {
      const prev = Array.isArray(p.correctAnswers) ? p.correctAnswers : [];
      const has = prev.includes(v);
      const next = has ? prev.filter((x) => x !== v) : [...prev, v];

      return {
        ...p,
        correctAnswers: next,
        // MSQ me correctAnswer empty rakho
        correctAnswer: "",
        correctAnswerHi: "",
      };
    });
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-[15px] sm:text-base font-black text-slate-900 leading-tight truncate">
            {editId ? "Edit Question" : "Add New Question"}
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold leading-snug">
            Required fields only — keep it quick.
          </p>
        </div>

        {editId ? (
          <button
            type="button"
            onClick={onReset}
            disabled={submitting}
            className="shrink-0 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        {/* Type + Marks + Negative */}
        <div className={cardCls}>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <div className="sm:col-span-5">
              <label className={labelCls}>Type</label>

              <select
                value={form.type}
                onChange={(e) => onSetType(e.target.value)}
                className={selectCls}
                disabled={submitting}
              >
                <option value="MCQ">MCQ</option>
                <option value="MSQ">MSQ (Multiple Correct)</option>
                <option value="MATH">MATH (Photo + Text)</option>
                <option value="ASSERTION_REASON">Assertion–Reasoning</option>
              </select>

              {isMSQ ? (
                <p className="mt-1 text-[10px] text-slate-600 font-semibold">
                  MSQ: {msqLang === "hindi" ? "HI" : "EN"} options par multiple tick karo. (Min 2)
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-3">
              <label className={labelCls}>Marks</label>
              <input
                type="number"
                value={form.marks ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, marks: e.target.value }))}
                className={inputCls}
                required
                disabled={submitting}
              />
            </div>

            <div className="sm:col-span-4">
              <label className={labelCls}>Negative (optional)</label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={form.negativeMarks ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, negativeMarks: e.target.value }))
                }
                className={inputCls}
                placeholder="e.g. 0.25"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Question Text */}
        {(isMCQ || isMSQ || isMath) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {(dualLang || langMode === "EN") && (
              <div className={cardCls}>
                <div className="flex items-center justify-between">
                  <label className={labelCls}>Question EN</label>
                  {isHindiOnly ? (
                    <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      optional
                    </span>
                  ) : null}
                </div>
                <textarea
                  value={form.questionText || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, questionText: e.target.value }))
                  }
                  rows={textareaRows}
                  className={inputCls}
                  placeholder="Write question in English..."
                  required={!isHindiOnly}
                  disabled={submitting}
                />
              </div>
            )}

            {(dualLang || langMode === "HI") && (
              <div className={cardCls}>
                <label className={labelCls}>Question HI</label>
                <textarea
                  value={form.questionTextHi || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, questionTextHi: e.target.value }))
                  }
                  rows={textareaRows}
                  className={inputCls}
                  placeholder="प्रश्न हिंदी में लिखें..."
                  disabled={submitting}
                />
              </div>
            )}
          </div>
        )}

        {/* Math image */}
        {isMath && (
          <div className={softCardCls}>
            <label className="block text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">
              Question Image
            </label>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm((p) => ({
                    ...p,
                    questionImageFile: file,
                    questionImageName: file?.name || "",
                  }));
                }}
                className={inputCls}
                disabled={submitting}
              />

              <span className="text-[10px] font-semibold text-slate-600">
                {form.questionImageName
                  ? `Selected: ${form.questionImageName}`
                  : "No image selected"}
              </span>
            </div>

            {form.questionImageUrl ? (
              <a
                href={form.questionImageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[10px] font-black uppercase tracking-widest text-blue-700 hover:underline"
              >
                View existing
              </a>
            ) : null}
          </div>
        )}

        {/* AR */}
        {isAR && (
          <div className={softCardCls}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {(dualLang || langMode === "EN") && (
                <div>
                  <label className={labelCls}>Assertion (EN)</label>
                  <textarea
                    rows={textareaRows}
                    value={form.assertionText || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, assertionText: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="Assertion in English"
                    disabled={submitting}
                  />

                  <label className={labelCls + " mt-2"}>Reason (EN)</label>
                  <textarea
                    rows={textareaRows}
                    value={form.reasonText || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reasonText: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="Reason in English"
                    disabled={submitting}
                  />
                </div>
              )}

              {(dualLang || langMode === "HI") && (
                <div>
                  <label className={labelCls}>Assertion (HI)</label>
                  <textarea
                    rows={textareaRows}
                    value={form.assertionTextHi || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, assertionTextHi: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="Assertion in Hindi"
                    disabled={submitting}
                  />

                  <label className={labelCls + " mt-2"}>Reason (HI)</label>
                  <textarea
                    rows={textareaRows}
                    value={form.reasonTextHi || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, reasonTextHi: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="Reason in Hindi"
                    disabled={submitting}
                  />
                </div>
              )}
            </div>

            <div className="mt-3">
              <label className={labelCls}>Correct Option</label>
              <select
                value={String(form.correctAnswerIndex ?? "")}
                onChange={(e) =>
                  setForm((p) => ({ ...p, correctAnswerIndex: e.target.value }))
                }
                className={selectCls}
                disabled={submitting}
              >
                <option value="">Select correct option</option>
                {AR_OPTIONS.map((opt, i) => (
                  <option key={i} value={String(i)}>
                    {`Option ${i + 1}: ${opt}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* MCQ/MSQ/MATH Options */}
        {(isMCQ || isMSQ || isMath) && (
          <div className={softCardCls}>
            {/* ---------- EN OPTIONS ---------- */}
            {(dualLang || langMode === "EN") && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                  Options EN
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(form.options || ["", "", "", ""]).map((opt, i) => {
                    const optVal = String(opt || "");
                    const checked = correctAnswers.includes(optVal.trim());

                    return (
                      <div key={i} className="flex gap-2 items-start">
                        {/* ✅ MSQ checkbox only if selecting EN */}
                        {isMSQ && msqLang === "english" ? (
                          <input
                            type="checkbox"
                            className="mt-2 h-4 w-4 accent-blue-600"
                            checked={checked}
                            onChange={() => toggleCorrectAnswer(optVal)}
                            disabled={submitting || !optVal.trim()}
                          />
                        ) : null}

                        <div className="flex-1">
                          <label className={labelCls}>
                            {isMSQ && msqLang === "english"
                              ? `Option ${i + 1} (tick if correct)`
                              : `Option ${i + 1}`}
                          </label>

                          <input
                            value={optVal}
                            onChange={(e) => {
                              const nextVal = e.target.value;

                              // ✅ MSQ: EN option rename => update selected list (only if msqLang=EN)
                              if (isMSQ && msqLang === "english") {
                                setForm((p) => {
                                  const prevOpts = Array.isArray(p.options)
                                    ? p.options
                                    : ["", "", "", ""];
                                  const prevVal = String(prevOpts[i] || "").trim();
                                  const nextTrim = String(nextVal || "").trim();

                                  let nextCorrect = Array.isArray(p.correctAnswers)
                                    ? [...p.correctAnswers]
                                    : [];

                                  if (prevVal && nextCorrect.includes(prevVal)) {
                                    nextCorrect = nextCorrect.filter((x) => x !== prevVal);
                                    if (nextTrim) nextCorrect.push(nextTrim);
                                  }

                                  return { ...p, correctAnswers: nextCorrect };
                                });
                              }

                              onOptionChange(i, nextVal);
                            }}
                            className={inputCls}
                            required={!isHindiOnly}
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* MCQ/MATH single correct */}
                {!isMSQ ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Correct EN</label>
                      <input
                        value={form.correctAnswer || ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, correctAnswer: e.target.value }))
                        }
                        className={inputCls}
                        required={!isHindiOnly}
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Quick Select</label>
                      <select
                        value={
                          (form.options || []).includes(form.correctAnswer)
                            ? form.correctAnswer
                            : ""
                        }
                        onChange={(e) =>
                          setForm((p) => ({ ...p, correctAnswer: e.target.value }))
                        }
                        className={selectCls}
                        disabled={submitting}
                      >
                        <option value="">Select from options</option>
                        {(form.options || []).map((x, i) => (
                          <option key={i} value={x}>
                            Option {i + 1}: {x || "—"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ---------- HI OPTIONS ---------- */}
            {(dualLang || langMode === "HI") && (
              <div className="space-y-2 mt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                  Options HI
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(form.optionsHi || ["", "", "", ""]).map((opt, i) => {
                    const optVal = String(opt || "");
                    const checked = correctAnswers.includes(optVal.trim());

                    return (
                      <div key={i} className="flex gap-2 items-start">
                        {/* ✅ MSQ checkbox only if selecting HI */}
                        {isMSQ && msqLang === "hindi" ? (
                          <input
                            type="checkbox"
                            className="mt-2 h-4 w-4 accent-blue-600"
                            checked={checked}
                            onChange={() => toggleCorrectAnswer(optVal)}
                            disabled={submitting || !optVal.trim()}
                          />
                        ) : null}

                        <div className="flex-1">
                          <label className={labelCls}>
                            {isMSQ && msqLang === "hindi"
                              ? `विकल्प ${i + 1} (सही हो तो टिक करें)`
                              : `विकल्प ${i + 1}`}
                          </label>

                          <input
                            value={optVal}
                            onChange={(e) => {
                              const nextVal = e.target.value;

                              // ✅ MSQ: HI option rename => update selected list (only if msqLang=HI)
                              if (isMSQ && msqLang === "hindi") {
                                setForm((p) => {
                                  const prevOpts = Array.isArray(p.optionsHi)
                                    ? p.optionsHi
                                    : ["", "", "", ""];
                                  const prevVal = String(prevOpts[i] || "").trim();
                                  const nextTrim = String(nextVal || "").trim();

                                  let nextCorrect = Array.isArray(p.correctAnswers)
                                    ? [...p.correctAnswers]
                                    : [];

                                  if (prevVal && nextCorrect.includes(prevVal)) {
                                    nextCorrect = nextCorrect.filter((x) => x !== prevVal);
                                    if (nextTrim) nextCorrect.push(nextTrim);
                                  }

                                  return { ...p, correctAnswers: nextCorrect };
                                });
                              }

                              onOptionHiChange(i, nextVal);
                            }}
                            className={inputCls}
                            disabled={submitting}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className={labelCls}>
                    Correct HI (optional){isMSQ ? " (disabled for MSQ)" : ""}
                  </label>
                  <select
                    value={form.correctAnswerHi || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, correctAnswerHi: e.target.value }))
                    }
                    className={selectCls}
                    disabled={submitting || isMSQ}
                  >
                    <option value="">Select from HI options</option>
                    {(form.optionsHi || []).map((x, i) => (
                      <option key={i} value={x}>
                        विकल्प {i + 1}: {x || "—"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ---------- MSQ Selected preview ---------- */}
            {isMSQ ? (
              <div className="rounded-lg bg-white border border-blue-100 p-2 mt-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">
                  MSQ Correct (selected {msqLang === "hindi" ? "HI" : "EN"})
                </div>
                {correctAnswers.length ? (
                  <ul className="list-disc pl-5 text-[12px] font-semibold text-slate-700 space-y-1">
                    {correctAnswers.map((x, idx) => (
                      <li key={idx}>{x}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[12px] font-semibold text-slate-500">
                    Tick at least <b>2</b> correct options.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
          <button
            type="button"
            onClick={onReset}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={submitting || !canSubmitNormal}
            className="rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? editId
                ? "Updating..."
                : "Adding..."
              : editId
              ? "Update Question"
              : "Add Question"}
          </button>
        </div>
      </form>
    </>
  );
}

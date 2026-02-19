// src/pages/admin/questions/components/PassageForm.jsx
import { AR_OPTIONS } from "../utils/constants";

export default function PassageForm({
  submitting,
  dualLang,
  langMode,
  isHindiOnly,
  passageText,
  setPassageText,
  passageTextHi,
  setPassageTextHi,
  passageSubs,
  setPassageSubs,
  passageValid,
  onSubmit,
  onReset,
}) {
  const showEN = Boolean(dualLang) || langMode === "EN";
  const showHI = Boolean(dualLang) || langMode === "HI";

  const addSubQuestion = () =>
    setPassageSubs((p) => [
      ...p,
      {
        type: "MCQ", // MCQ/MSQ/MATH/ASSERTION_REASON
        questionText: "",
        questionTextHi: "",
        options: ["", "", "", ""],
        optionsHi: ["", "", "", ""],

        // MCQ/MATH single
        correctAnswer: "",
        correctAnswerHi: "",

        // ✅ MSQ multi
        correctAnswers: [], // EN strings only

        // AR
        assertionText: "",
        reasonText: "",
        assertionTextHi: "",
        reasonTextHi: "",
        correctAnswerIndex: "",

        // MATH
        questionImageFile: null,
        questionImageName: "",

        marks: "2",
        negativeMarks: "0.33",
      },
    ]);

  const removeSubQuestion = (idx) =>
    setPassageSubs((p) => p.filter((_, i) => i !== idx));

  const updateSub = (idx, patch) =>
    setPassageSubs((p) => p.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const toggleSubCorrect = (idx, optText) => {
    const v = String(optText || "").trim();
    if (!v) return;

    const s = passageSubs[idx] || {};
    const prev = Array.isArray(s.correctAnswers) ? s.correctAnswers : [];
    const has = prev.includes(v);
    const next = has ? prev.filter((x) => x !== v) : [...prev, v];

    updateSub(idx, {
      correctAnswers: next,
      correctAnswer: "",
      correctAnswerHi: "",
    });
  };

  const updateSubOption = (idx, optIdx, value) => {
    const s = passageSubs[idx] || {};
    const prevOpts = Array.isArray(s.options) ? s.options : ["", "", "", ""];
    const prevVal = String(prevOpts[optIdx] || "").trim();

    const opts = [...prevOpts];
    opts[optIdx] = value;

    // ✅ if MSQ and option text changed, keep correctAnswers synced
    if (s.type === "MSQ") {
      const nextVal = String(value || "").trim();
      const prevCorrect = Array.isArray(s.correctAnswers) ? s.correctAnswers : [];
      let nextCorrect = [...prevCorrect];

      if (prevVal && nextCorrect.includes(prevVal)) {
        nextCorrect = nextCorrect.filter((x) => x !== prevVal);
        if (nextVal) nextCorrect.push(nextVal);
      }

      updateSub(idx, { options: opts, correctAnswers: nextCorrect });
      return;
    }

    updateSub(idx, { options: opts });
  };

  const updateSubOptionHi = (idx, optIdx, value) => {
    const s = passageSubs[idx] || {};
    const prevOpts = Array.isArray(s.optionsHi) ? s.optionsHi : ["", "", "", ""];
    const prevVal = String(prevOpts[optIdx] || "").trim();

    const opts = [...prevOpts];
    opts[optIdx] = value;

    // ✅ if MSQ and option text changed, keep correctAnswers synced
    if (s.type === "MSQ") {
      const nextVal = String(value || "").trim();
      const prevCorrect = Array.isArray(s.correctAnswers) ? s.correctAnswers : [];
      let nextCorrect = [...prevCorrect];

      if (prevVal && nextCorrect.includes(prevVal)) {
        nextCorrect = nextCorrect.filter((x) => x !== prevVal);
        if (nextVal) nextCorrect.push(nextVal);
      }

      updateSub(idx, { optionsHi: opts, correctAnswers: nextCorrect });
      return;
    }

    updateSub(idx, { optionsHi: opts });
  };

  // styling helpers
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

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="text-[15px] sm:text-base font-black text-slate-900 leading-tight">
            Passage Builder
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold leading-snug">
            Add passage + multiple sub-questions (multiple entries create honge).
          </p>
        </div>

        <span
          className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
            passageValid
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {passageValid ? "Ready" : "Incomplete"}
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        {/* Passage text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {showEN && (
            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <label className={labelCls}>Passage EN</label>
                {isHindiOnly ? (
                  <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    optional
                  </span>
                ) : null}
              </div>
              <textarea
                value={passageText}
                onChange={(e) => setPassageText(e.target.value)}
                rows={4}
                className={inputCls}
                placeholder="Paste paragraph here..."
                required={!isHindiOnly}
                disabled={submitting}
              />
            </div>
          )}

          {showHI && (
            <div className={cardCls}>
              <label className={labelCls}>Passage HI</label>
              <textarea
                value={passageTextHi}
                onChange={(e) => setPassageTextHi(e.target.value)}
                rows={4}
                className={inputCls}
                placeholder="अनुच्छेद यहाँ पेस्ट करें..."
                disabled={submitting}
              />
            </div>
          )}
        </div>

        {/* Sub questions */}
        <div className="space-y-2">
          {passageSubs.map((s, idx) => {
            const isSubAR = s.type === "ASSERTION_REASON";
            const isSubMath = s.type === "MATH";
            const isSubMSQ = s.type === "MSQ";
            const subCorrect = Array.isArray(s.correctAnswers) ? s.correctAnswers : [];
            
            // ✅ MSQ selection language: same logic as NormalQuestionForm
            const subMsqLang = isHindiOnly || langMode === "HI" ? "hindi" : "english";

            return (
              <div key={idx} className={softCardCls}>
                {/* Sub header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                      Sub Q #{idx + 1}
                    </span>
                    <span className="text-[10px] font-black text-slate-500">
                      ({s.type})
                    </span>
                  </div>

                  {passageSubs.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeSubQuestion(idx)}
                      disabled={submitting}
                      className="text-[10px] font-black uppercase tracking-widest text-red-700 hover:text-red-900 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {/* Type + Marks + Negative */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <label className={labelCls}>Type</label>

                    <select
                      value={s.type}
                      onChange={(e) => {
                        const t = e.target.value;

                        if (t === "ASSERTION_REASON") {
                          updateSub(idx, {
                            type: t,
                            // reset AR
                            assertionText: "",
                            reasonText: "",
                            assertionTextHi: "",
                            reasonTextHi: "",
                            correctAnswerIndex: "",
                            options: [...AR_OPTIONS],
                            correctAnswer: "",
                            correctAnswerHi: "",
                            correctAnswers: [],
                            // clear non-ar
                            questionText: "",
                            questionTextHi: "",
                            optionsHi: ["", "", "", ""],
                            questionImageFile: null,
                            questionImageName: "",
                          });
                          return;
                        }

                        if (t === "MSQ") {
                          updateSub(idx, {
                            type: "MSQ",
                            questionText: "",
                            questionTextHi: "",
                            options: ["", "", "", ""],
                            optionsHi: ["", "", "", ""],
                            correctAnswers: [],
                            correctAnswer: "",
                            correctAnswerHi: "",
                            // clear others
                            assertionText: "",
                            reasonText: "",
                            assertionTextHi: "",
                            reasonTextHi: "",
                            correctAnswerIndex: "",
                            questionImageFile: null,
                            questionImageName: "",
                          });
                          return;
                        }

                        // MCQ or MATH
                        updateSub(idx, {
                          type: t,
                          questionText: "",
                          questionTextHi: "",
                          options: ["", "", "", ""],
                          optionsHi: ["", "", "", ""],
                          correctAnswer: "",
                          correctAnswerHi: "",
                          correctAnswers: [],
                          // clear others
                          assertionText: "",
                          reasonText: "",
                          assertionTextHi: "",
                          reasonTextHi: "",
                          correctAnswerIndex: "",
                          questionImageFile: null,
                          questionImageName: "",
                        });
                      }}
                      className={selectCls}
                      disabled={submitting}
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="MSQ">MSQ (Multiple Correct)</option>
                      <option value="MATH">MATH (Photo + Text)</option>
                      <option value="ASSERTION_REASON">Assertion–Reasoning</option>
                    </select>

                    {isSubMSQ ? (
                      <p className="mt-1 text-[10px] text-slate-600 font-semibold">
                        MSQ: tick multiple correct options (EN).
                      </p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-3">
                    <label className={labelCls}>Marks</label>
                    <input
                      type="number"
                      placeholder="2"
                      value={s.marks ?? "2"}
                      min={0}
                      step="0.25"
                      onChange={(e) => updateSub(idx, { marks: e.target.value })}
                      className={inputCls}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className={labelCls}>Negative</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.33"
                      value={s.negativeMarks ?? "0.33"}
                      onChange={(e) => updateSub(idx, { negativeMarks: e.target.value })}
                      className={inputCls}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Content */}
                {isSubAR ? (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {showEN && (
                        <>
                          <div>
                            <label className={labelCls}>Assertion EN</label>
                            <textarea
                              value={s.assertionText || ""}
                              onChange={(e) => updateSub(idx, { assertionText: e.target.value })}
                              rows={2}
                              className={inputCls}
                              required
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Reason EN</label>
                            <textarea
                              value={s.reasonText || ""}
                              onChange={(e) => updateSub(idx, { reasonText: e.target.value })}
                              rows={2}
                              className={inputCls}
                              required
                              disabled={submitting}
                            />
                          </div>
                        </>
                      )}

                      {showHI && (
                        <>
                          <div>
                            <label className={labelCls}>Assertion HI</label>
                            <textarea
                              value={s.assertionTextHi || ""}
                              onChange={(e) => updateSub(idx, { assertionTextHi: e.target.value })}
                              rows={2}
                              className={inputCls}
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Reason HI</label>
                            <textarea
                              value={s.reasonTextHi || ""}
                              onChange={(e) => updateSub(idx, { reasonTextHi: e.target.value })}
                              rows={2}
                              className={inputCls}
                              disabled={submitting}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      <div>
                        <label className={labelCls}>Correct Option</label>
                        <select
                          value={s.correctAnswerIndex ?? ""}
                          onChange={(e) =>
                            updateSub(idx, {
                              correctAnswerIndex: e.target.value,
                              correctAnswer: AR_OPTIONS[Number(e.target.value)] || "",
                            })
                          }
                          className={selectCls}
                          required
                          disabled={submitting}
                        >
                          <option value="">Select A/B/C/D</option>
                          {AR_OPTIONS.map((t, i) => (
                            <option key={i} value={i}>
                              {String.fromCharCode(65 + i)}. {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-lg bg-white border border-blue-100 p-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">
                          Options (fixed)
                        </div>
                        <ol className="list-decimal pl-5 space-y-0.5 text-[12px] font-semibold text-slate-700">
                          {AR_OPTIONS.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {/* Question EN/HI */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {showEN && (
                        <div>
                          <label className={labelCls}>Question EN</label>
                          <textarea
                            value={s.questionText || ""}
                            onChange={(e) => updateSub(idx, { questionText: e.target.value })}
                            rows={2}
                            className={inputCls}
                            required={!isHindiOnly}
                            disabled={submitting}
                          />
                        </div>
                      )}

                      {showHI && (
                        <div>
                          <label className={labelCls}>Question HI</label>
                          <textarea
                            value={s.questionTextHi || ""}
                            onChange={(e) => updateSub(idx, { questionTextHi: e.target.value })}
                            rows={2}
                            className={inputCls}
                            disabled={submitting}
                          />
                        </div>
                      )}
                    </div>

                    {/* Math image */}
                    {isSubMath && (
                      <div className={cardCls}>
                        <label className={labelCls}>Upload Image</label>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              updateSub(idx, {
                                questionImageFile: file,
                                questionImageName: file?.name || "",
                              });
                            }}
                            className={inputCls}
                            disabled={submitting}
                          />
                          <span className="text-[10px] font-semibold text-slate-600">
                            {s.questionImageName ? `Selected: ${s.questionImageName}` : "No image selected"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Options EN/HI */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {showEN && (
                        <div className={cardCls}>
                          <div className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                            Options EN
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {(s.options || ["", "", "", ""]).map((opt, i) => {
                              const optVal = String(opt || "");
                              const checked = subCorrect.includes(optVal.trim());

                              return (
                                <div key={i} className="flex gap-2 items-start">
                                  {isSubMSQ && subMsqLang === "english" ? (
                                    <input
                                      type="checkbox"
                                      className="mt-2 h-4 w-4 accent-blue-600"
                                      checked={checked}
                                      onChange={() => toggleSubCorrect(idx, optVal)}
                                      disabled={submitting || !optVal.trim()}
                                    />
                                  ) : null}

                                  <div className="flex-1">
                                    <label className={labelCls}>
                                      {isSubMSQ && subMsqLang === "english" ? `Option ${i + 1} (tick if correct)` : `Option ${i + 1}`}
                                    </label>
                                    <input
                                      value={optVal}
                                      onChange={(e) => updateSubOption(idx, i, e.target.value)}
                                      className={inputCls}
                                      required={!isHindiOnly}
                                      disabled={submitting}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {isSubMSQ && subMsqLang === "english" ? (
                            <div className="mt-2 rounded-lg bg-white border border-blue-100 p-2">
                              <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">
                                MSQ Correct (selected EN)
                              </div>
                              {subCorrect.length ? (
                                <ul className="list-disc pl-5 text-[12px] font-semibold text-slate-700 space-y-1">
                                  {subCorrect.map((x, ii) => (
                                    <li key={ii}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[12px] font-semibold text-slate-500">
                                  Tick at least one correct option.
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}

                      {showHI && (
                        <div className={cardCls}>
                          <div className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                            Options HI
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {(s.optionsHi || ["", "", "", ""]).map((opt, i) => {
                              const optVal = String(opt || "");
                              const checked = subCorrect.includes(optVal.trim());

                              return (
                                <div key={`hi-${i}`} className="flex gap-2 items-start">
                                  {isSubMSQ && subMsqLang === "hindi" ? (
                                    <input
                                      type="checkbox"
                                      className="mt-2 h-4 w-4 accent-blue-600"
                                      checked={checked}
                                      onChange={() => toggleSubCorrect(idx, optVal)}
                                      disabled={submitting || !optVal.trim()}
                                    />
                                  ) : null}

                                  <div className="flex-1">
                                    <label className={labelCls}>
                                      {isSubMSQ && subMsqLang === "hindi" ? `विकल्प ${i + 1} (सही हो तो टिक करें)` : `विकल्प ${i + 1}`}
                                    </label>
                                    <input
                                      value={optVal}
                                      onChange={(e) => updateSubOptionHi(idx, i, e.target.value)}
                                      className={inputCls}
                                      disabled={submitting}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {isSubMSQ && subMsqLang === "hindi" ? (
                            <div className="mt-2 rounded-lg bg-white border border-blue-100 p-2">
                              <div className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-1">
                                MSQ Correct (selected HI)
                              </div>
                              {subCorrect.length ? (
                                <ul className="list-disc pl-5 text-[12px] font-semibold text-slate-700 space-y-1">
                                  {subCorrect.map((x, ii) => (
                                    <li key={ii}>{x}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[12px] font-semibold text-slate-500">
                                  Tick at least one correct option.
                                </p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Correct answers (MCQ/MATH only) */}
                    {!isSubMSQ ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {showEN && (
                          <div className={cardCls}>
                            <label className={labelCls}>Correct EN</label>
                            <input
                              value={s.correctAnswer || ""}
                              onChange={(e) => updateSub(idx, { correctAnswer: e.target.value })}
                              className={inputCls}
                              required={!isHindiOnly}
                              disabled={submitting}
                            />
                          </div>
                        )}

                        {showHI && (
                          <div className={cardCls}>
                            <label className={labelCls}>Correct HI (optional)</label>
                            <select
                              value={s.correctAnswerHi || ""}
                              onChange={(e) => updateSub(idx, { correctAnswerHi: e.target.value })}
                              className={selectCls}
                              disabled={submitting}
                            >
                              <option value="">Select from HI options</option>
                              {(s.optionsHi || []).map((opt, i) => (
                                <option key={i} value={opt}>
                                  विकल्प {i + 1}: {opt || "—"}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-1">
          <button
            type="button"
            onClick={addSubQuestion}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
          >
            + Add Sub Question
          </button>

          <div className="flex gap-2 sm:justify-end">
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
              disabled={submitting || !passageValid}
              className="rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Passage"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

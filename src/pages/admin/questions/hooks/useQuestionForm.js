// src/pages/admin/questions/hooks/useQuestionForm.js
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../../../services/axiosInstance";
import { AR_OPTIONS } from "../utils/constants";
import { emptyAR, emptyMath, emptyMCQ } from "../utils/questionTemplate";
import {
  validateAR,
  validateMCQorMATH,
  parseARText,
  findARIndex,
} from "../utils/questionHelpers";

/** STRICT reads */
const pickTextStrict = (v, lang = "EN") => {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  if (lang === "HI") return String(v.hindi || "").trim();
  return String(v.english || "").trim();
};

const pickOptionStrict = (opt, lang = "EN") => {
  if (!opt) return "";
  if (typeof opt === "string") return opt.trim();
  if (lang === "HI") return String(opt.hindi || "").trim();
  return String(opt.english || "").trim();
};

const normalizeOptions4Strict = (opts, lang = "EN") => {
  const arr = Array.isArray(opts) ? opts : [];
  const out = arr.slice(0, 4).map((x) => pickOptionStrict(x, lang));
  while (out.length < 4) out.push("");
  return out;
};

const deriveCorrectAnswerHiSingle = (question) => {
  const caEn = String(question?.correctAnswer || "").trim();
  if (!caEn) return "";
  const options = Array.isArray(question?.options) ? question.options : [];
  const idx = options.findIndex((o) => String(o?.english || "").trim() === caEn);
  if (idx < 0) return "";
  return String(options?.[idx]?.hindi || "").trim();
};

const toOptObjs4 = (enArr, hiArr) => {
  const en = Array.isArray(enArr) ? enArr : ["", "", "", ""];
  const hi = Array.isArray(hiArr) ? hiArr : ["", "", "", ""];
  return Array.from({ length: 4 }).map((_, i) => ({
    english: String(en[i] || "").trim(),
    hindi: String(hi[i] || "").trim(),
  }));
};

const mapHiToEnSingle = (caHi, hiOpts, enOpts) => {
  const val = String(caHi || "").trim();
  if (!val) return "";
  const idx = (hiOpts || []).findIndex((x) => String(x || "").trim() === val);
  if (idx >= 0) return String((enOpts || [])[idx] || "").trim();
  return "";
};

const mapEnToHiSingle = (caEn, enOpts, hiOpts) => {
  const val = String(caEn || "").trim();
  if (!val) return "";
  const idx = (enOpts || []).findIndex((x) => String(x || "").trim() === val);
  if (idx >= 0) return String((hiOpts || [])[idx] || "").trim();
  return "";
};

/** ✅ MSQ validate (language-aware) */
const validateMSQ = (form, isHindiOnly) => {
  const enQ = String(form.questionText || "").trim();
  const hiQ = String(form.questionTextHi || "").trim();

  // question rule: EN required unless hindiOnly; hindiOnly => at least one (EN/HI) ok
  if (!isHindiOnly && !enQ) return false;
  if (isHindiOnly && !enQ && !hiQ) return false;

  const enOpts = (Array.isArray(form.options) ? form.options : ["", "", "", ""])
    .slice(0, 4)
    .map((x) => String(x || "").trim());

  const hiOpts = (Array.isArray(form.optionsHi) ? form.optionsHi : ["", "", "", ""])
    .slice(0, 4)
    .map((x) => String(x || "").trim());

  // ✅ options required based on mode
  const optList = isHindiOnly ? hiOpts : enOpts;
  if (optList.filter(Boolean).length < 4) return false;

  const selected = Array.isArray(form.correctAnswers) ? form.correctAnswers : [];
  const cleaned = selected.map((x) => String(x || "").trim()).filter(Boolean);

  if (cleaned.length < 2) return false; // ✅ min 2
  if (!cleaned.every((x) => optList.includes(x))) return false; // ✅ must match selected language options
  if (new Set(cleaned).size !== cleaned.length) return false; // ✅ unique

  return true;
};

export default function useQuestionForm({ testId, isHindiOnly }) {
  const [form, setForm] = useState(() => ({
    ...emptyMCQ(),
    correctAnswers: [],
  }));
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isMCQ = form.type === "MCQ";
  const isMSQ = form.type === "MSQ";
  const isMath = form.type === "MATH";
  const isAR = form.type === "ASSERTION_REASON";

  const canSubmitNormal = useMemo(() => {
    if (isMSQ) return validateMSQ(form, isHindiOnly);
    if (isMCQ || isMath) return validateMCQorMATH(form, isHindiOnly);
    if (isAR) return validateAR(form, isHindiOnly);
    return true;
  }, [form, isHindiOnly, isMCQ, isMSQ, isMath, isAR]);

  const resetNormal = useCallback(() => {
    setForm({ ...emptyMCQ(), correctAnswers: [] });
    setEditId(null);
  }, []);

  const setType = useCallback((t) => {
    setEditId(null);

    if (t === "MCQ") setForm({ ...emptyMCQ(), correctAnswers: [] });
    else if (t === "MSQ")
      setForm({
        ...emptyMCQ(),
        type: "MSQ",
        correctAnswers: [],
        correctAnswer: "",
        correctAnswerHi: "",
      });
    else if (t === "MATH") setForm({ ...emptyMath(), correctAnswers: [] });
    else if (t === "ASSERTION_REASON") setForm({ ...emptyAR(), correctAnswers: [] });
    else setForm({ ...emptyMCQ(), correctAnswers: [] });
  }, []);

  /** ✅ option change + MSQ sync (EN) */
  const handleOptionChange = useCallback((index, value) => {
    setForm((p) => {
      const prevOpts = [...(p.options || ["", "", "", ""])];
      const prevVal = String(prevOpts[index] || "").trim();

      const updated = [...prevOpts];
      updated[index] = value;

      // ✅ MSQ: only sync selections with EN options when NOT hindiOnly
      if (p.type === "MSQ" && !isHindiOnly) {
        const nextVal = String(value || "").trim();
        const prevSel = Array.isArray(p.correctAnswers) ? p.correctAnswers : [];
        let nextSel = [...prevSel];

        if (prevVal && nextSel.includes(prevVal)) {
          nextSel = nextSel.filter((x) => x !== prevVal);
          if (nextVal) nextSel.push(nextVal);
        }

        nextSel = Array.from(new Set(nextSel));
        return { ...p, options: updated, correctAnswers: nextSel };
      }

      return { ...p, options: updated };
    });
  }, [isHindiOnly]);

  /** ✅ option change + MSQ sync (HI) */
  const handleOptionHiChange = useCallback((index, value) => {
    setForm((p) => {
      const prevOpts = [...(p.optionsHi || ["", "", "", ""])];
      const prevVal = String(prevOpts[index] || "").trim();

      const updated = [...prevOpts];
      updated[index] = value;

      // ✅ MSQ: sync selections with HI options when hindiOnly
      if (p.type === "MSQ" && isHindiOnly) {
        const nextVal = String(value || "").trim();
        const prevSel = Array.isArray(p.correctAnswers) ? p.correctAnswers : [];
        let nextSel = [...prevSel];

        if (prevVal && nextSel.includes(prevVal)) {
          nextSel = nextSel.filter((x) => x !== prevVal);
          if (nextVal) nextSel.push(nextVal);
        }

        nextSel = Array.from(new Set(nextSel));
        return { ...p, optionsHi: updated, correctAnswers: nextSel };
      }

      return { ...p, optionsHi: updated };
    });
  }, [isHindiOnly]);

  /** ✅ handleEdit */
  const handleEdit = useCallback((q) => {
    setEditId(q._id);
    if (typeof window !== "undefined") {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    }

    const t = q.type || "MCQ";
    const neg = q?.negativeMarks ?? 0;

    const qEn = pickTextStrict(q.questionText, "EN");
    const qHi = pickTextStrict(q.questionText, "HI");

    if (t === "ASSERTION_REASON") {
      const meta = q?.meta || {};

      // helper: try many sources to extract assertion/reason
      const tryParse = (txt) => {
        if (!txt) return { assertionText: "", reasonText: "" };
        const p = parseARText(String(txt || ""));
        if (p.assertionText || p.reasonText) return p;

        // fallback: multi-line heuristic — collect all text between ASSERTION: and REASON:
        const text = String(txt || "");
        let a = "", r = "";

        // Match everything from ASSERTION: to REASON:
        const assertMatch = text.match(/ASSERTION:\s*([\s\S]*?)(?:\nREASON:|reason:)/i);
        if (assertMatch) {
          a = assertMatch[1].trim();
        }

        // Match everything from REASON: to end
        const reasonMatch = text.match(/REASON:\s*([\s\S]*?)$/i);
        if (reasonMatch) {
          r = reasonMatch[1].trim();
        }

        return { assertionText: a, reasonText: r };
      };

      // primary sources
      let parsed = tryParse(qEn || q.questionText || "");
      let parsedHi = tryParse(qHi || (q.questionText && q.questionText.hindi) || "");

      // secondary: meta fields
      const metaHi = meta.hi || {};
      if (!parsed.assertionText && String(meta.assertionText || "").trim()) {
        parsed.assertionText = String(meta.assertionText || "").trim();
      }
      if (!parsed.reasonText && String(meta.reasonText || "").trim()) {
        parsed.reasonText = String(meta.reasonText || "").trim();
      }

      if (!parsed.assertionText && String(metaHi.assertionText || "").trim()) {
        parsed.assertionText = String(metaHi.assertionText || "").trim();
      }
      if (!parsed.reasonText && String(metaHi.reasonText || "").trim()) {
        parsed.reasonText = String(metaHi.reasonText || "").trim();
      }

      if (!parsedHi.assertionText && String(metaHi.assertionText || "").trim()) {
        parsedHi.assertionText = String(metaHi.assertionText || "").trim();
      }
      if (!parsedHi.reasonText && String(metaHi.reasonText || "").trim()) {
        parsedHi.reasonText = String(metaHi.reasonText || "").trim();
      }

      // correct answer index sources
      const caEn = String(q?.correctAnswer || "").trim();
      const idxSource = caEn || String(metaHi.correctAnswer || "").trim() || String(meta.correctAnswer || "").trim();
      const idx = findARIndex(idxSource);

      setForm({
        ...emptyAR(),
        assertionText: parsed.assertionText || "",
        reasonText: parsed.reasonText || "",
        assertionTextHi: parsedHi.assertionText || "",
        reasonTextHi: parsedHi.reasonText || "",
        correctAnswerIndex: idx >= 0 ? String(idx) : "",
        correctAnswer: caEn || String(meta.correctAnswer || "") || String(metaHi.correctAnswer || ""),
        marks: q.marks ?? "",
        negativeMarks: String(neg ?? 0),
        correctAnswers: [],
      });
      return;
    }

    if (t === "MATH") {
      const optsEn = normalizeOptions4Strict(q.options, "EN");
      const optsHi = normalizeOptions4Strict(q.options, "HI");
      const qLang = String(q?.questionLang || "").trim().toLowerCase();
      let caEn = "";
      let caHi = "";

      if (qLang === "hindi") {
        caHi = String(q?.correctAnswer || "").trim();
        caEn = mapHiToEnSingle(caHi, optsHi, optsEn);
      } else {
        caEn = String(q?.correctAnswer || "").trim();
        caHi = deriveCorrectAnswerHiSingle(q);
      }

      setForm({
        ...emptyMath(),
        questionText: qEn,
        questionTextHi: qHi,
        options: optsEn,
        optionsHi: optsHi,
        correctAnswer: caEn || "",
        correctAnswerHi: caHi || "",
        marks: q.marks ?? "",
        negativeMarks: String(neg ?? 0),
        questionImageUrl: q.questionImage?.url || "",
        questionImagePublicId: q.questionImage?.publicId || "",
        questionImageFile: null,
        correctAnswers: [],
      });
      return;
    }

    if (t === "MSQ") {
      const optsEn = normalizeOptions4Strict(q.options, "EN");
      const optsHi = normalizeOptions4Strict(q.options, "HI");

      const arr = Array.isArray(q.correctAnswers) ? q.correctAnswers : [];
      // Map stored correct answers to the form's language view
      const rawCorrects = arr.map((x) => String(x || "").trim()).filter(Boolean);

      let correctAnswers = rawCorrects;
      if (!isHindiOnly) {
        // If stored answers already match EN options, keep them.
        const allMatchEn = rawCorrects.length > 0 && rawCorrects.every((v) => optsEn.includes(v));
        if (allMatchEn) {
          correctAnswers = rawCorrects;
        } else {
          // Otherwise try mapping HI -> EN (stored may be HI)
          correctAnswers = Array.from(
            new Set(
              rawCorrects
                .map((val) => mapHiToEnSingle(val, optsHi, optsEn))
                .filter(Boolean)
            )
          );
        }
      } else {
        // Hindi-only view: prefer HI answers
        correctAnswers = rawCorrects;
      }

      setForm({
        ...emptyMCQ(),
        type: "MSQ",
        questionText: qEn,
        questionTextHi: qHi,
        options: optsEn,
        optionsHi: optsHi,
        correctAnswers,
        correctAnswer: "",
        correctAnswerHi: "",
        marks: q.marks ?? "",
        negativeMarks: String(neg ?? 0.33),
      });
      return;
    }

    // MCQ default
    const optsEn = normalizeOptions4Strict(q.options, "EN");
    const optsHi = normalizeOptions4Strict(q.options, "HI");
    const qLang = String(q?.questionLang || "").trim().toLowerCase();
    let caEn = "";
    let caHi = "";

    if (qLang === "hindi") {
      caHi = String(q?.correctAnswer || "").trim();
      caEn = mapHiToEnSingle(caHi, optsHi, optsEn);
    } else {
      caEn = String(q?.correctAnswer || "").trim();
      caHi = deriveCorrectAnswerHiSingle(q);
    }

    setForm({
      ...emptyMCQ(),
      type: "MCQ",
      questionText: qEn,
      questionTextHi: qHi,
      options: optsEn,
      optionsHi: optsHi,
      correctAnswer: caEn || "",
      correctAnswerHi: caHi || "",
      marks: q.marks ?? "",
      negativeMarks: String(neg ?? 0),
      correctAnswers: [],
    });
  }, []);

  const buildNormalPayload = useCallback(() => {
    const marks = String(form.marks ?? "").trim() === "" ? 2 : Number(form.marks);
    const negativeMarks =
      String(form.negativeMarks ?? "").trim() === "" ? 0.33 : Number(form.negativeMarks);

    const enQT = String(form.questionText || "").trim();
    const hiQT = String(form.questionTextHi || "").trim();

    const questionText = { english: enQT, hindi: hiQT };

    const enOpts = (Array.isArray(form.options) ? form.options : ["", "", "", ""])
      .slice(0, 4)
      .map((x) => String(x || "").trim());

    const hiOpts = (Array.isArray(form.optionsHi) ? form.optionsHi : ["", "", "", ""])
      .slice(0, 4)
      .map((x) => String(x || "").trim());

    const options = toOptObjs4(enOpts, hiOpts);

    const base = { testId, marks, negativeMarks };

    // ✅ controller validates by lang
    const lang = isHindiOnly ? "hindi" : "english";

    if (isMSQ) {
      let correctAnswers = Array.isArray(form.correctAnswers)
        ? form.correctAnswers.map((x) => String(x || "").trim()).filter(Boolean)
        : [];

      correctAnswers = Array.from(new Set(correctAnswers));

      // ✅ filter by selected language option list
      const optList = isHindiOnly ? hiOpts : enOpts;
      correctAnswers = correctAnswers.filter((x) => optList.includes(x));

      return {
        ...base,
        type: "MSQ",
        lang,
        questionText,
        options,
        correctAnswers,
      };
    }

    if (isMCQ || isMath) {
      const caEn = String(form.correctAnswer || "").trim();
      const caHi = String(form.correctAnswerHi || "").trim();

      // ✅ correctAnswer must be in selected language
      let correctAnswer = "";

      if (isHindiOnly) {
        correctAnswer = caHi || mapEnToHiSingle(caEn, enOpts, hiOpts);
      } else {
        correctAnswer = caEn || mapHiToEnSingle(caHi, hiOpts, enOpts);
      }

      return {
        ...base,
        type: isMCQ ? "MCQ" : "MATH",
        lang,
        questionText,
        options,
        correctAnswer,
      };
    }

    // AR
    const idx = Number(form.correctAnswerIndex);
    const correct = AR_OPTIONS[idx] || "";
    const enA = String(form.assertionText || "").trim();
    const enR = String(form.reasonText || "").trim();
    const hiA = String(form.assertionTextHi || "").trim();
    const hiR = String(form.reasonTextHi || "").trim();

    return {
      ...base,
      type: "ASSERTION_REASON",
      lang,
      questionText: {
        english: `ASSERTION: ${enA || hiA}\nREASON: ${enR || hiR}`,
        hindi: `ASSERTION: ${hiA || enA}\nREASON: ${hiR || enR}`,
      },
      options: AR_OPTIONS.slice(0, 4).map((t) => ({ english: t, hindi: t })),
      correctAnswer: correct,
    };
  }, [form, isMCQ, isMSQ, isMath, testId, isHindiOnly]);

  const submitNormal = useCallback(
    async ({ fetchQuestions }) => {
      if (!canSubmitNormal) {
        toast.error("Please fill required fields");
        return;
      }

      setSubmitting(true);
      try {
        const payload = buildNormalPayload();

        // basic safety
        if (payload.type === "MSQ") {
          if (!Array.isArray(payload.correctAnswers) || payload.correctAnswers.length < 2) {
            toast.error("MSQ: select at least 2 correct answers");
            return;
          }
        }

        const hasImage = payload.type === "MATH" && form.questionImageFile;

        if (hasImage) {
          const fd = new FormData();
          fd.append("testId", payload.testId);
          fd.append("type", payload.type);
          fd.append("lang", String(payload.lang || "english")); // ✅ IMPORTANT
          fd.append("questionText", JSON.stringify(payload.questionText || {}));
          fd.append("options", JSON.stringify(payload.options || []));
          fd.append("negativeMarks", String(payload.negativeMarks ?? 0.33));
          fd.append("correctAnswer", String(payload.correctAnswer || ""));
          fd.append("marks", String(payload.marks ?? 0));
          fd.append("image", form.questionImageFile);

          if (editId) {
            await axios.put(`/questions/${editId}`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Question updated");
          } else {
            await axios.post("/questions", fd, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Question added");
          }
        } else {
          if (editId) {
            await axios.put(`/questions/${editId}`, payload);
            toast.success("Question updated");
          } else {
            await axios.post("/questions", payload);
            toast.success("Question added");
          }
        }

        resetNormal();
        await fetchQuestions();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (typeof err?.response?.data === "string" ? err.response.data : null) ||
          "Bad Request (400)";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [buildNormalPayload, canSubmitNormal, editId, form.questionImageFile, resetNormal]
  );

  return {
    form,
    setForm,
    editId,
    setEditId,
    submitting,

    isMCQ,
    isMSQ,
    isMath,
    isAR,

    canSubmitNormal,
    setType,
    resetNormal,
    handleEdit,

    handleOptionChange,
    handleOptionHiChange,

    submitNormal,
  };
}

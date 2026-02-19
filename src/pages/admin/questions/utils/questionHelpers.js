import { AR_OPTIONS } from "./constants";

export const getIsHindiOnly = ({ dualLang, langMode }) => !dualLang && langMode === "HI";

export const pickQuestionText = (obj, isHindiOnly) => {
  if (!isHindiOnly) return obj.questionText;
  return String(obj.questionText || "").trim() ? obj.questionText : obj.questionTextHi;
};

export const pickOptions = (obj, isHindiOnly) => {
  if (!isHindiOnly) return obj.options;
  const en = Array.isArray(obj.options) ? obj.options : [];
  const hi = Array.isArray(obj.optionsHi) ? obj.optionsHi : [];
  const enHasAny = en.some((x) => String(x || "").trim());
  return enHasAny ? en : hi;
};

export const pickCorrectAnswer = (obj, isHindiOnly) => {
  if (!isHindiOnly) return obj.correctAnswer;
  return String(obj.correctAnswer || "").trim() ? obj.correctAnswer : obj.correctAnswerHi;
};

export const buildMetaPayload = (form) => {
  return {
    ...(form.meta || {}),
    negativeMarks:
      String(form.negativeMarks ?? "").trim() === "" ? 0 : Number(form.negativeMarks),
    hi: {
      correctAnswer: form.correctAnswerHi || "",
      questionText: String(form.questionTextHi || "").trim() || "",
      options: Array.isArray(form.optionsHi)
        ? form.optionsHi.map((x) => String(x || ""))
        : ["", "", "", ""],
      assertionText: String(form.assertionTextHi || "").trim() || "",
      reasonText: String(form.reasonTextHi || "").trim() || "",
    },
  };
};

export const parseARText = (questionText = "") => {
  const text = String(questionText || "");
  
  // Extract assertion: between "ASSERTION:" and "\nREASON:"
  let a = "";
  if (text.includes("ASSERTION:")) {
    const afterAssertion = text.split("ASSERTION:")[1];
    a = afterAssertion?.split(/\nREASON:/i)[0]?.trim() || "";
  }
  
  // Extract reason: after "\nREASON:" to end
  let r = "";
  const reasonMatch = text.match(/\nREASON:\s*([\s\S]*?)$/i);
  if (reasonMatch) {
    r = reasonMatch[1]?.trim() || "";
  } else if (text.includes("REASON:")) {
    r = text.split(/REASON:/i)[1]?.trim() || "";
  }
  
  return { assertionText: a || "", reasonText: r || "" };
};

export const findARIndex = (correctAnswer) => AR_OPTIONS.findIndex((x) => x === correctAnswer);

export const validateNeg = (negativeMarks) => {
  const neg = String(negativeMarks ?? "").trim();
  return neg === "" || (!Number.isNaN(Number(neg)) && Number(neg) >= 0);
};

export const validateMCQorMATH = (form, isHindiOnly) => {
  const qText = pickQuestionText(form, isHindiOnly);
  const opts = pickOptions(form, isHindiOnly) || [];
  const correct = pickCorrectAnswer(form, isHindiOnly);

  const hasQ = String(qText || "").trim().length > 0;
  const all4 = opts.length === 4 && opts.every((x) => String(x).trim().length > 0);
  const hasCorrect = String(correct || "").trim().length > 0;
  const hasMarks = String(form.marks || "").trim().length > 0;

  return hasQ && all4 && hasCorrect && hasMarks && validateNeg(form.negativeMarks);
};

export const validateTheory = (form, isHindiOnly) => {
  const qText = pickQuestionText(form, isHindiOnly);
  const hasQ = String(qText || "").trim().length > 0;
  const hasMarks = String(form.marks || "").trim().length > 0;
  return hasQ && hasMarks && validateNeg(form.negativeMarks);
};

export const validateAR = (form, isHindiOnly = false) => {
  const assertionEn = String(form.assertionText || "").trim();
  const reasonEn = String(form.reasonText || "").trim();
  const assertionHi = String(form.assertionTextHi || "").trim();
  const reasonHi = String(form.reasonTextHi || "").trim();

  const a = isHindiOnly ? (assertionHi || assertionEn) : assertionEn;
  const r = isHindiOnly ? (reasonHi || reasonEn) : reasonEn;

  const hasA = String(a || "").trim().length > 0;
  const hasR = String(r || "").trim().length > 0;

  const idx = String(form.correctAnswerIndex || "").trim();
  const hasIdx = idx !== "" && Number(idx) >= 0 && Number(idx) <= 3;
  const hasMarks = String(form.marks || "").trim().length > 0;
  return hasA && hasR && hasIdx && hasMarks && validateNeg(form.negativeMarks);
};

export const getBasePassageText = ({ passageText, passageTextHi, isHindiOnly }) => {
  const en = String(passageText || "").trim();
  const hi = String(passageTextHi || "").trim();
  return isHindiOnly ? (en || hi) : en;
};

export const validatePassage = ({ basePassageText, passageSubs, isHindiOnly }) => {
  if (!String(basePassageText || "").trim()) return false;
  if (!passageSubs?.length) return false;

  for (const s of passageSubs) {
    const marksOk = String(s.marks || "").trim().length > 0;
    if (!marksOk) return false;

    if (!validateNeg(s.negativeMarks)) return false;

    if (s.type === "ASSERTION_REASON") {
      const assertionEn = String(s.assertionText || "").trim();
      const reasonEn = String(s.reasonText || "").trim();
      const assertionHi = String(s.assertionTextHi || "").trim();
      const reasonHi = String(s.reasonTextHi || "").trim();

      const a = isHindiOnly ? (assertionHi || assertionEn) : assertionEn;
      const r = isHindiOnly ? (reasonHi || reasonEn) : reasonEn;

      const idx = String(s.correctAnswerIndex || "").trim();
      const hasIdx = idx !== "" && Number(idx) >= 0 && Number(idx) <= 3;
      if (!(String(a || "").trim().length > 0 && String(r || "").trim().length > 0 && hasIdx)) return false;
    } else if (s.type === "MSQ") {
      // ✅ MSQ validation: need multiple correct answers
      const qText = pickQuestionText(s, isHindiOnly);
      const opts = pickOptions(s, isHindiOnly) || [];
      const correctArr = Array.isArray(s.correctAnswers) ? s.correctAnswers : [];
      const cleaned = correctArr.map((x) => String(x || "").trim()).filter(Boolean);

      const qOk = String(qText || "").trim().length > 0;
      const all4 = opts.length === 4 && opts.every((x) => String(x).trim().length > 0);
      const cOk = cleaned.length >= 2; // ✅ min 2 for MSQ

      if (!(qOk && all4 && cOk)) return false;
    } else {
      // ✅ MCQ/MATH/etc: single correct answer
      const qText = pickQuestionText(s, isHindiOnly);
      const opts = pickOptions(s, isHindiOnly) || [];
      const correct = pickCorrectAnswer(s, isHindiOnly);

      const qOk = String(qText || "").trim().length > 0;
      const all4 = opts.length === 4 && opts.every((x) => String(x).trim().length > 0);
      const cOk = String(correct || "").trim().length > 0;

      if (!(qOk && all4 && cOk)) return false;
    }
  }
  return true;
};

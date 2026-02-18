export const toOptObjs4 = (enArr, hiArr) => {
  const en = Array.isArray(enArr) ? enArr : ["", "", "", ""];
  const hi = Array.isArray(hiArr) ? hiArr : ["", "", "", ""];
  return Array.from({ length: 4 }).map((_, i) => ({
    english: String(en[i] || "").trim(),
    hindi: String(hi[i] || "").trim(),
  }));
};

// ✅ correctAnswerHi from correctAnswer(english) + options index
export const deriveCorrectAnswerHi = (question) => {
  const caEn = String(question?.correctAnswer || "").trim();
  if (!caEn) return "";

  const options = Array.isArray(question?.options) ? question.options : [];
  const idx = options.findIndex((o) => String(o?.english || "").trim() === caEn);
  if (idx < 0) return "";

  return String(options?.[idx]?.hindi || "").trim();
};

const questionStart = /^(?:q(?:uestion)?\s*)?\d{1,4}\s*[.):]\s+\S/i;
const optionStart = /^(?:\(([A-D])\)|([A-D])\s*[).])\s*(.*)$/i;
const answerPattern =
  /(?:correct\s+)?(?:answer|ans)\s*(?:is\s*)?[:.)-]\s*([A-D](?:\s*(?:,|and|&)\s*[A-D])*)\b/gi;

export function parseQuestionText(text) {
  const lines = text
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const blocks = [];
  for (const line of lines) {
    if (questionStart.test(line)) {
      blocks.push([line.replace(/^(?:q(?:uestion)?\s*)?\d{1,4}\s*[.):]\s*/i, "")]);
    } else if (blocks.length) {
      blocks[blocks.length - 1].push(line);
    }
  }

  return blocks.map((block) => {
    const options = ["A", "B", "C", "D"].map((id) => ({
      id,
      text: { english: "", hindi: "" },
    }));
    const answerIds = new Set();
    const questionLines = [];
    let activeOption = null;

    for (const line of block) {
      const answers = [...line.matchAll(answerPattern)];
      for (const answer of answers) {
        answer[1]
          .toUpperCase()
          .match(/[A-D]/g)
          ?.forEach((id) => answerIds.add(id));
      }

      const lineWithoutAnswer = line.replace(answerPattern, "").trim();
      if (!lineWithoutAnswer) continue;

      const optionMatch = lineWithoutAnswer.match(optionStart);
      if (optionMatch) {
        activeOption = (optionMatch[1] || optionMatch[2]).toUpperCase();
        options.find((option) => option.id === activeOption).text.english =
          optionMatch[3].trim();
      } else if (activeOption) {
        const option = options.find((item) => item.id === activeOption);
        option.text.english = `${option.text.english} ${lineWithoutAnswer}`.trim();
      } else {
        questionLines.push(lineWithoutAnswer);
      }
    }

    return {
      type: answerIds.size > 1 ? "MSQ" : "MCQ",
      questionText: { english: questionLines.join(" ").trim(), hindi: "" },
      options,
      correctAnswers: [...answerIds],
      marks: 2,
      negativeMarks: 0.33,
      difficulty: "MEDIUM",
    };
  });
}

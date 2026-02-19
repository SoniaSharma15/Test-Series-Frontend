import { AR_OPTIONS } from "./constants";

export const emptyMCQ = () => ({
  type: "MCQ",
  questionText: "",
  questionTextHi: "",
  options: ["", "", "", ""],
  optionsHi: ["", "", "", ""],
  correctAnswer: "",
  correctAnswerHi: "",
  marks: "2",
  negativeMarks: "0.33",
  allowImage: false,
});

export const emptyMSQ = () => ({
  type: "MSQ", // ✅ backend enum MSQ
  questionText: "",
  questionTextHi: "",
  options: ["", "", "", ""],
  optionsHi: ["", "", "", ""],
  correctAnswers: [], // ✅ multiple correct EN option texts
  marks: "2",
  negativeMarks: "0.33",
  allowImage: false,
});

export const emptyMath = () => ({
  type: "MATH",
  questionText: "",
  questionTextHi: "",
  options: ["", "", "", ""],
  optionsHi: ["", "", "", ""],
  correctAnswer: "",
  correctAnswerHi: "",
  marks: "2",
  negativeMarks: "0.33",
  questionImageFile: null,
  questionImageName: "",
});

export const emptyAR = () => ({
  type: "ASSERTION_REASON",
  assertionText: "",
  reasonText: "",
  assertionTextHi: "",
  reasonTextHi: "",
  options: [...AR_OPTIONS],
  correctAnswerIndex: "",
  correctAnswer: "",
  marks: "2",
  negativeMarks: "0.33",
});

// ✅ PASSAGE sub question template
export const emptyPassageSub = () => ({
  type: "MCQ", // default sub question MCQ
  questionText: "",
  questionTextHi: "",
  options: ["", "", "", ""],
  optionsHi: ["", "", "", ""],

  // MCQ/MATH single
  correctAnswer: "",
  correctAnswerHi: "",

  // MSQ multiple
  correctAnswers: [],

  assertionText: "",
  reasonText: "",
  assertionTextHi: "",
  reasonTextHi: "",
  correctAnswerIndex: "",

  questionImageFile: null,
  questionImageName: "",

  marks: "2",
  negativeMarks: "0.33",
});

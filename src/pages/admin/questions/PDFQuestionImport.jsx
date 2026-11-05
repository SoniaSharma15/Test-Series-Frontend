import { useState } from "react";
import { FileUp, LoaderCircle, Trash2 } from "lucide-react";
import axios from "../../../services/axiosInstance";
import toast from "react-hot-toast";
import { parseQuestionText } from "./pdfQuestionParser";

async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });

  try {
    const pdf = await loadingTask.promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const items = content.items
        .filter((item) => "str" in item && item.str.trim())
        .map((item) => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
        }))
        .sort((a, b) => b.y - a.y || a.x - b.x);

      const lines = [];
      for (const item of items) {
        const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 2);
        if (line) line.items.push(item);
        else lines.push({ y: item.y, items: [item] });
      }

      pages.push(
        lines
          .map((line) =>
            line.items
              .sort((a, b) => a.x - b.x)
              .map((item) => item.text)
              .join(" ")
              .trim(),
          )
          .filter(Boolean)
          .join("\n"),
      );
    }
    return pages.join("\n");
  } finally {
    await loadingTask.destroy();
  }
}

function getQuestionErrors(question) {
  const errors = [];
  if (!question.questionText.english.trim()) errors.push("Question text is missing.");
  if (question.options.some((option) => !option.text.english.trim())) {
    errors.push("Fill in all four options.");
  }
  if (!question.correctAnswers.length) errors.push("Select a correct answer.");
  if (question.type === "MCQ" && question.correctAnswers.length > 1) {
    errors.push("MCQ questions can only have one correct answer.");
  }
  return errors;
}

export default function PDFQuestionImport({ testId, onImportComplete }) {
  const [questions, setQuestions] = useState([]);
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Choose a PDF file.");
      return;
    }

    setExtracting(true);
    setSaveResult(null);
    setQuestions([]);
    setFileName(file.name);
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        throw new Error(
          "No selectable text was found. Scanned/image-only PDFs are not supported.",
        );
      }
      const parsed = parseQuestionText(text);
      if (!parsed.length) {
        throw new Error(
          "No questions found. Format each question as a numbered line with A)–D) options.",
        );
      }
      setQuestions(parsed);
      toast.success(`Found ${parsed.length} question${parsed.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setFileName("");
      toast.error(error.message || "Could not read this PDF.");
    } finally {
      setExtracting(false);
    }
  };

  const updateQuestion = (questionIndex, update) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex ? { ...question, ...update } : question,
      ),
    );
    setSaveResult(null);
  };

  const updateOption = (questionIndex, optionId, value) => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              options: question.options.map((option) =>
                option.id === optionId
                  ? { ...option, text: { ...option.text, english: value } }
                  : option,
              ),
            }
          : question,
      ),
    );
    setSaveResult(null);
  };

  const toggleAnswer = (questionIndex, optionId) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question;
        const correctAnswers = question.correctAnswers.includes(optionId)
          ? question.correctAnswers.filter((answer) => answer !== optionId)
          : question.type === "MSQ"
            ? [...question.correctAnswers, optionId]
            : [optionId];
        return { ...question, correctAnswers };
      }),
    );
    setSaveResult(null);
  };

  const handleImport = async () => {
    const invalidCount = questions.filter(
      (question) => getQuestionErrors(question).length,
    ).length;
    if (invalidCount) {
      toast.error(`Review the ${invalidCount} incomplete question${invalidCount === 1 ? "" : "s"} first.`);
      return;
    }

    setSaving(true);
    setSaveResult(null);
    let imported = 0;
    const failures = [];
    const failedIndices = new Set();

    try {
      for (let index = 0; index < questions.length; index += 1) {
        try {
          await axios.post("/questions", {
            ...questions[index],
            testId,
          });
          imported += 1;
        } catch (error) {
          failedIndices.add(index);
          failures.push({
            index: index + 1,
            message: error?.response?.data?.message || "Failed to save question.",
          });
        }
      }

      if (imported) {
        await onImportComplete();
        if (!failures.length) {
          setQuestions([]);
          setFileName("");
          toast.success(`Imported ${imported} question${imported === 1 ? "" : "s"}.`);
        } else {
          setQuestions((current) =>
            current.filter((_, index) => failedIndices.has(index)),
          );
          toast.error(`Imported ${imported}; ${failures.length} could not be saved.`);
        }
      } else {
        toast.error("No questions were imported.");
      }
      setSaveResult({ imported, failures });
    } catch (error) {
      toast.error(error?.message || "Could not refresh the question list.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">Import questions from PDF</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Extract selectable PDF text, review the questions and answers, then add them to this test.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-blue-700 has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
          {extracting ? <LoaderCircle className="animate-spin" size={16} /> : <FileUp size={16} />}
          {extracting ? "Extracting PDF..." : "Choose PDF"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFile}
            disabled={extracting || saving}
            className="sr-only"
          />
        </label>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-6 text-slate-600">
        <p className="font-bold text-slate-700">Supported text layout</p>
        <p>Number each question, put each A)–D) option on its own line, and include an answer such as “Answer: B”.</p>
        <p>Scanned/image-only PDFs need OCR and cannot be extracted here.</p>
      </div>

      {fileName && (
        <p className="mt-4 text-xs font-bold text-slate-600">
          PDF: <span className="text-slate-900">{fileName}</span>
        </p>
      )}

      {questions.length > 0 && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-black text-slate-900">
              Review {questions.length} extracted question{questions.length === 1 ? "" : "s"}
            </h3>
            <button
              type="button"
              onClick={handleImport}
              disabled={saving || questions.some((question) => getQuestionErrors(question).length)}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Adding questions..." : "Add to this test"}
            </button>
          </div>

          {questions.map((question, questionIndex) => {
            const errors = getQuestionErrors(question);
            return (
              <article key={questionIndex} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Question {questionIndex + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <select
                      aria-label={`Question ${questionIndex + 1} type`}
                      value={question.type}
                      onChange={(event) => updateQuestion(questionIndex, { type: event.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold"
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="MSQ">MSQ</option>
                    </select>
                    <button
                      type="button"
                      aria-label={`Remove question ${questionIndex + 1}`}
                      onClick={() => {
                        setQuestions((current) => current.filter((_, index) => index !== questionIndex));
                        setSaveResult(null);
                      }}
                      className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <textarea
                  aria-label={`Question ${questionIndex + 1} text`}
                  rows={2}
                  value={question.questionText.english}
                  onChange={(event) =>
                    updateQuestion(questionIndex, {
                      questionText: { ...question.questionText, english: event.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800"
                  placeholder="Question text"
                />

                <div className="grid gap-2 sm:grid-cols-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <label className="flex min-w-8 items-center gap-2 text-xs font-black text-slate-600">
                        <input
                          type={question.type === "MSQ" ? "checkbox" : "radio"}
                          name={`answer-${questionIndex}`}
                          checked={question.correctAnswers.includes(option.id)}
                          onChange={() => toggleAnswer(questionIndex, option.id)}
                          aria-label={`Mark option ${option.id} as correct for question ${questionIndex + 1}`}
                        />
                        {option.id}
                      </label>
                      <input
                        aria-label={`Option ${option.id} for question ${questionIndex + 1}`}
                        value={option.text.english}
                        onChange={(event) => updateOption(questionIndex, option.id, event.target.value)}
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800"
                        placeholder={`Option ${option.id}`}
                      />
                    </div>
                  ))}
                </div>

                {errors.length > 0 && (
                  <p className="text-xs font-semibold text-rose-600">{errors.join(" ")}</p>
                )}
              </article>
            );
          })}
          {saveResult?.imported > 0 && (
            <p className="text-xs font-bold text-emerald-700">
              Added {saveResult.imported} question{saveResult.imported === 1 ? "" : "s"}.
              {saveResult.failures.length > 0 && " Correct the failures below and retry."}
            </p>
          )}
          {saveResult?.failures?.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <p className="font-black">Some questions could not be saved:</p>
              {saveResult.failures.map((failure) => (
                <p key={`${failure.index}-${failure.message}`}>
                  Question {failure.index}: {failure.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

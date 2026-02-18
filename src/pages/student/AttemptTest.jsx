import { useEffect, useState, useRef } from "react";
import axios from "../../services/axiosInstance";
import { useParams } from "react-router-dom";

export default function AttemptTest() {
  const { testId } = useParams();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [visitedCount, setVisitedCount] = useState(0);

  useEffect(() => {
    fetchTest();
    fetchQuestions();
    startAttempt();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const fetchTest = async () => {
    try {
      const res = await axios.get(`/tests/${testId}`);
      setTest(res.data);
    } catch (err) {
      console.error("Error fetching test:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`/questions/${testId}`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const startAttempt = async () => {
    try {
      await axios.post("/attempts/start", { testId });
    } catch (err) {
      console.error("Error starting attempt:", err);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      updateCounts(updated);
      return updated;
    });
  };

  const updateCounts = (answersObj) => {
    const answered = Object.keys(answersObj).filter(id => answersObj[id]).length;
    setAnsweredCount(answered);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto) {
      const confirm = window.confirm("Are you sure you want to submit?");
      if (!confirm) return;
    }

    clearInterval(timerRef.current);

    const formattedAnswers = Object.keys(answers).map((qId) => ({
      questionId: qId,
      answer: answers[qId],
    }));

    try {
      const res = await axios.post("/attempts/submit", {
        testId,
        answers: formattedAnswers,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Error submitting test:", err);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;
    return `${hrs}:${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Test Submitted ✅
          </h2>
          <p className="text-xl mb-2">
            Score: <span className="font-bold">{result.score}%</span>
          </p>
          <p className="text-gray-600">
            Attempt #: {result.attemptNumber}
          </p>
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold">{test.name || "THE BRILLIANT BIHAR: PRELIMS 2026"}</h1>
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
          TIME LEFT: {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex h-[calc(100vh-80px)] overflow-hidden">
        
        {/* LEFT SIDEBAR - Passage/Content */}
        <div className="w-1/4 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-600 mb-4 uppercase">Reading Comprehension</h3>
          <div className="text-sm text-gray-700 leading-relaxed italic">
            {currentQuestion?.passage || "Sample passage text would appear here..."}
          </div>
        </div>

        {/* CENTER - Question & Options */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
          <div className="max-w-2xl">
            {/* Question Header */}
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg mb-6 font-semibold text-sm">
              Q{currentQuestionIndex + 1} | READING COMP
            </div>

            {/* Question Text */}
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              {currentQuestion?.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion?.options?.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition
                    ${
                      answers[currentQuestion._id] === opt
                        ? "bg-blue-50 border-blue-500"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion._id}
                    value={opt}
                    checked={answers[currentQuestion._id] === opt}
                    onChange={(e) =>
                      handleAnswerChange(currentQuestion._id, e.target.value)
                    }
                    className="mt-1 mr-3 w-4 h-4"
                  />
                  <span className="text-gray-700">
                    {i + 1}. {opt}
                  </span>
                </label>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                PREVIOUS
              </button>
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                SAVE & NEXT
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - Question Palette */}
        <div className="w-1/4 bg-white border-l border-gray-200 p-6 overflow-y-auto flex flex-col">
          <h3 className="text-sm font-bold text-gray-600 mb-4">QUESTION PALETTE</h3>
          
          {/* Question Grid */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {questions.map((q, index) => (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-10 flex items-center justify-center rounded-lg font-semibold text-sm transition
                  ${
                    currentQuestionIndex === index
                      ? "bg-blue-600 text-white border-2 border-blue-800"
                      : answers[q._id]
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="border-t pt-4 space-y-2 text-xs mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">ANSWERED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">NOT ANSWERED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-gray-600">NOT VISITED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-gray-600">REVIEW</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Answered</span>
              <span className="font-bold text-gray-800">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Visited (no answer)</span>
              <span className="font-bold text-gray-800">{visitedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Not Visited</span>
              <span className="font-bold text-gray-800">{questions.length - answeredCount - visitedCount}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleSubmit(false)}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
          >
            FINAL SUBMIT
          </button>
        </div>

      </div>
    </div>
  );
}

// src/pages/admin/questions/hooks/useQuestions.js
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "../../../../services/axiosInstance";

export default function useQuestions({ testId, location, navigate, onAutoEdit }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ keep latest onAutoEdit without re-creating fetchQuestions
  const onAutoEditRef = useRef(onAutoEdit);
  useEffect(() => {
    onAutoEditRef.current = onAutoEdit;
  }, [onAutoEdit]);

  const fetchQuestions = useCallback(async () => {
    if (!testId) return;

    setLoading(true);
    try {
      const res = await axios.get(`/questions/${testId}`);

      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : payload?.data?.data && Array.isArray(payload.data.data)
        ? payload.data.data
        : [];

      setQuestions(list);

      // ✅ auto edit from query ?editQ=...
      const params = new URLSearchParams(location.search);
      const editQ = params.get("editQ");

      if (editQ) {
        const found = list.find((x) => String(x._id) === String(editQ));
        if (found && typeof onAutoEditRef.current === "function") {
          onAutoEditRef.current(found);

          // ✅ remove editQ from URL so it won't retrigger
          params.delete("editQ");
          const qs = params.toString();
          navigate(`${location.pathname}${qs ? `?${qs}` : ""}`, { replace: true });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [testId, location.search, location.pathname, navigate]); // ✅ removed onAutoEdit

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, setQuestions, loading, fetchQuestions };
}

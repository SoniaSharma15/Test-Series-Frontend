// src/pages/admin/QuestionsTablePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../services/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import QuestionsLibrary from "./questions/QuestionLibrary";

export default function QuestionsTablePage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [langMode, setLangMode] = useState("EN"); // EN | HI

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`/questions/${testId}`);
      const payload = res?.data;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : payload?.data?.data || []; // just in case

      setQuestions(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error("Failed to load questions");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // ✅ WORKING EDIT: opens ManageQuestions and tells which question to edit via query param
  const handleEdit = (q) => {
    if (!q?._id) return;

    const params = new URLSearchParams(location.search);
    const seriesId = params.get("seriesId");

    const qs = new URLSearchParams();
    if (seriesId) qs.set("seriesId", seriesId);
    qs.set("editQ", q._id);

    toast.success("Opening Question Editor…");
    navigate(`/admin/questions/${testId}?${qs.toString()}`);
  };

  // ✅ ConfirmDialog uses deleteId
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`/questions/${deleteId}`);
      toast.success("Question deleted");
      setDeleteId(null);
      fetchQuestions();
    } catch (e) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-6">
          {/* Simple Header */}
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Questions <span className="text-blue-600">Library</span>
            </h1>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              Edit or delete existing questions for this test.
            </p>
          </div>

          {/* ✅ Reused component */}
          <QuestionsLibrary
            loading={loading}
            questions={questions}
            fetchQuestions={fetchQuestions}
            handleEdit={handleEdit}
            setDeleteId={setDeleteId}
            langMode={langMode}
          />
        </div>

        {/* ✅ Confirm delete */}
        <ConfirmDialog
          open={Boolean(deleteId)}
          title="Delete Question?"
          description="This action cannot be undone. The question and its image (if any) will be permanently deleted."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          danger
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => {
            if (!deleteLoading) setDeleteId(null);
          }}
        />
      </main>
    </div>
  );
}

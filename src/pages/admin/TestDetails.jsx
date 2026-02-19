import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../services/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import QuestionsLibrary from "./questions/QuestionLibrary"
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
    setLoading(true);
    try {
      const res = await axios.get(`/questions/${testId}`);

      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      setQuestions(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // ✅ MUST accept q from QuestionsTable
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

   /* ---------- Handle Delete ---------- */
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`/questions/${deleteId}`);
      toast.success("Question deleted");
      setDeleteId(null);
      fetchQuestions();
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Questions</h2>
          <p className="text-sm text-slate-500">All questions for this test</p>
        </div>
{/* Question Library */}
<QuestionsLibrary
  loading={loading}
  questions={questions}
  fetchQuestions={fetchQuestions}
  handleEdit={handleEdit}
  setDeleteId={setDeleteId}
  langMode={langMode}
/>
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

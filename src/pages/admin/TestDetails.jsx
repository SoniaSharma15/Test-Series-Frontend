// src/pages/admin/QuestionsTablePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../services/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";

import {
  LayoutDashboard,
  ClipboardList,
  ChevronRight,
  Image as ImageIcon,
  Search,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function QuestionsTablePage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTest = async () => {
    try {
      const res = await axios.get(`/tests/${testId}`);
      setTest(res?.data?.data || res?.data);
    } catch {
      toast.error("Failed to load test");
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/questions/${testId}`);
      const payload = res?.data;
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setQuestions(list);
      setFilteredQuestions(list);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTest();
    fetchQuestions();
  }, [testId]);

  // Handle Filtering
  useEffect(() => {
    const results = questions.filter((q) => {
      const text = getDisplayText(q).toLowerCase();
      return text.includes(searchTerm.toLowerCase()) || q.type.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredQuestions(results);
  }, [searchTerm, questions]);

  const getDisplayText = (q) => {
    if (!q) return "-";
    switch (q.type) {
      case "PASSAGE":
        return q.passageText?.english?.slice(0, 120) + "..." || "Passage Content";
      case "ASSERTION_REASON":
        return `A: ${q.assertion?.english || ""} | R: ${q.reason?.english || ""}`;
      case "MATH":
        return q.questionText?.english || "Math Question (Image/Formula)";
      default:
        return q.questionText?.english || "-";
    }
  };

  const handleEdit = (q) => {
    const params = new URLSearchParams(location.search);
    const seriesId = params.get("seriesId");
    const qs = new URLSearchParams();
    if (seriesId) qs.set("seriesId", seriesId);
    qs.set("editQ", q._id);
    navigate(`/admin/questions/${testId}?${qs.toString()}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question forever?")) return;
    try {
      await axios.delete(`/questions/${id}`);
      toast.success("Question removed");
      fetchQuestions();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-8">
          
          {/* ================= HEADER ================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 mb-2">
                <LayoutDashboard size={14} /> Admin
                <ChevronRight size={14} className="text-slate-300" />
                <ClipboardList size={14} /> Questions
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Questions <span className="text-blue-600">Library</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">Review and manage the database for this assessment.</p>
            </div>

            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search questions..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full md:w-80 shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ================= TEST INFO CARD ================= */}
          {test && (
            <div className="relative bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm overflow-hidden">
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider">Active Resource</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">{test.title}</h2>
                  <p className="text-slate-500 text-sm mt-1 max-w-2xl leading-relaxed">{test.description}</p>
                </div>
                <div className="hidden lg:flex flex-col items-end">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions Count</p>
                    <p className="text-3xl font-black text-blue-600">{questions.length}</p>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-5%] opacity-[0.03] rotate-12 -z-0">
                <BookOpen size={240} />
              </div>
            </div>
          )}

          {/* ================= TABLE AREA ================= */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                <p className="mt-4 font-bold text-slate-400">Loading Library...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="text-slate-300" size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No questions found</h3>
                <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400">
                      <th className="p-5 text-left font-black uppercase text-[10px] tracking-widest">#</th>
                      <th className="p-5 text-left font-black uppercase text-[10px] tracking-widest">Question Preview</th>
                      <th className="p-5 text-left font-black uppercase text-[10px] tracking-widest">Details</th>
                      <th className="p-5 text-left font-black uppercase text-[10px] tracking-widest">Marks</th>
                      <th className="p-5 text-right font-black uppercase text-[10px] tracking-widest">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {filteredQuestions.map((q, index) => (
                      <tr key={q._id} className="group hover:bg-blue-50/30 transition-all duration-200">
                        <td className="p-5 align-top">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </span>
                        </td>

                        <td className="p-5 align-top max-w-[600px]">
                          <div className="text-slate-800 font-bold text-base leading-snug line-clamp-2">
                            {getDisplayText(q)}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-400">
                              <Layers size={12} /> {q.type}
                            </span>
                            {q.image && (
                              <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-blue-600">
                                <ImageIcon size={12} /> Media Attached
                              </span>
                            )}
                            {q.type === "PASSAGE" && (
                                <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-purple-50 border border-purple-100 px-2 py-1 rounded-md text-purple-600">
                                    {q.passageQuestions?.length || 0} Sub-Questions
                                </span>
                            )}
                          </div>
                        </td>

                        <td className="p-5 align-top">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                             q.difficulty === 'hard' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                             q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {q.difficulty || "Medium"}
                          </span>
                        </td>

                        <td className="p-5 align-top">
                          <div className="font-bold text-slate-700">{q.marks ?? "-"}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Weightage</div>
                        </td>

                        <td className="p-5 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(q)}
                              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(q._id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
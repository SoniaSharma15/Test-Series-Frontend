// src/pages/admin/ManageTests.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "../../services/axiosInstance";
import { Link, useSearchParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import toast from "react-hot-toast";
import {
  BookOpen,
  CalendarClock,
  Clock,
  GraduationCap,
  Hash,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  ChevronDown,
  ClipboardList,
} from "lucide-react";

import ConfirmDialog from "../../components/ui/ConfirmDialog";

function useDebounce(value, delay = 350) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

// ✅ SUBJECT NORMALIZER (string OR object {english,hindi,_id})
const subjectLabel = (s) => {
  if (!s) return "";
  if (typeof s === "string") return s.trim();
  return String(s.english || s.hindi || s.name || s.title || "").trim();
};

const normalizeSubjectCSV = (s) =>
  String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .join(", ");

function toDatetimeLocalValue(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fmtDateTime(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ManageTests() {
  const [searchParams] = useSearchParams();
  const forcedSeriesId = searchParams.get("seriesId");

  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(forcedSeriesId || "");

  const [tests, setTests] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ✅ subjects always string[]
  const [subjects, setSubjects] = useState([]);

  const [form, setForm] = useState({
    subject: "", // backend wants string (CSV)
    name: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    scheduledTime: "",
  });

  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [q, setQ] = useState("");
  const debQ = useDebounce(q, 250);

  const topRef = useRef(null);

  // ✅ fetch series
  const fetchSeries = async () => {
    setLoadingSeries(true);
    try {
      const res = await axios.get("/test-series");
      const list = Array.isArray(res.data) ? res.data : [];
      setSeriesList(list);

      // forced series
      if (forcedSeriesId) {
        const forced = list.find((x) => x._id === forcedSeriesId);
        if (forced) {
          setSelectedSeriesId(forcedSeriesId);
          const subList = Array.isArray(forced?.subjects) ? forced.subjects : [];
          setSubjects(subList.map(subjectLabel).filter(Boolean));
          return;
        }
      }

      // keep current if exists
      if (selectedSeriesId && list.some((s) => s._id === selectedSeriesId)) return;

      // default select first
      if (list.length > 0) {
        setSelectedSeriesId(list[0]._id);
        const subList = Array.isArray(list[0]?.subjects) ? list[0].subjects : [];
        setSubjects(subList.map(subjectLabel).filter(Boolean));
      } else {
        setSelectedSeriesId("");
        setSubjects([]);
      }
    } catch (e) {
      toast.error("Failed to load test series");
      setSeriesList([]);
      setSelectedSeriesId("");
      setSubjects([]);
    } finally {
      setLoadingSeries(false);
    }
  };

  const fetchTests = async (seriesId) => {
    setLoadingTests(true);
    try {
      const res = await axios.get(`/tests/by-series/${seriesId}`);
      setTests(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error("Failed to load tests");
      setTests([]);
    } finally {
      setLoadingTests(false);
    }
  };

  // ✅ on mount / forcedSeriesId change
  useEffect(() => {
    fetchSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedSeriesId]);

  // ✅ whenever selectedSeriesId changes: update subjects + fetch tests
  useEffect(() => {
    if (!selectedSeriesId) {
      setTests([]);
      setSubjects([]);
      return;
    }

    const s = seriesList.find((x) => x._id === selectedSeriesId);
    const subList = Array.isArray(s?.subjects) ? s.subjects : [];
    setSubjects(subList.map(subjectLabel).filter(Boolean));

    fetchTests(selectedSeriesId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId]);

  // ✅ when seriesList loads later (first load), sync subjects for current selected series
  useEffect(() => {
    if (!selectedSeriesId) return;
    const s = seriesList.find((x) => x._id === selectedSeriesId);
    const subList = Array.isArray(s?.subjects) ? s.subjects : [];
    setSubjects(subList.map(subjectLabel).filter(Boolean));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesList]);

  const resetForm = () => {
    setForm({
      subject: "",
      name: "",
      duration: "",
      totalMarks: "",
      passingMarks: "",
      scheduledTime: "",
    });
    setEditId(null);
  };

  const selectedSubjectValues = useMemo(() => {
    return String(form.subject || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [form.subject]);

  const canSubmit = useMemo(() => {
    if (!selectedSeriesId) return false;
    if (!String(form.subject || "").trim()) return false;
    if (!String(form.name || "").trim()) return false;
    if (!String(form.duration || "").trim()) return false;
    if (!String(form.totalMarks || "").trim()) return false;
    if (!String(form.passingMarks || "").trim()) return false;
    return true;
  }, [form, selectedSeriesId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload = {
        testSeriesId: selectedSeriesId,
        subject: normalizeSubjectCSV(form.subject), // ✅ normalized
        name: String(form.name || "").trim(),
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        scheduledTime: form.scheduledTime
          ? new Date(form.scheduledTime).toISOString()
          : undefined,
      };
      if (!payload.scheduledTime) delete payload.scheduledTime;

      if (editId) {
        await axios.put(`/tests/${editId}`, payload);
        toast.success("Test updated");
      } else {
        await axios.post("/tests", payload);
        toast.success("Test created");
      }

      resetForm();
      fetchTests(selectedSeriesId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Server error while saving test");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (test) => {
    setEditId(test._id);

    setForm({
      subject: normalizeSubjectCSV(test?.subject),
      name: String(test?.name || ""),
      duration: String(test?.duration ?? ""),
      totalMarks: String(test?.totalMarks ?? ""),
      passingMarks: String(test?.passingMarks ?? ""),
      scheduledTime: toDatetimeLocalValue(test?.scheduledTime),
    });

    setTimeout(
      () => topRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }),
      0
    );
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`/tests/${deleteId}`);
      toast.success("Test deleted");
      fetchTests(selectedSeriesId);
    } catch (e) {
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const selectedSeries = seriesList.find((s) => s._id === selectedSeriesId);
  const selectedSeriesTitle = selectedSeries?.title || "";

  const filteredTests = useMemo(() => {
    const list = Array.isArray(tests) ? tests : [];
    const qq = String(debQ || "").trim().toLowerCase();
    if (!qq) return list;
    return list.filter((t) => {
      const name = String(t?.name || "").toLowerCase();
      const sub = String(t?.subject || "").toLowerCase();
      return name.includes(qq) || sub.includes(qq);
    });
  }, [tests, debQ]);

  const hasSubjects = Array.isArray(subjects) && subjects.length > 0;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div
          ref={topRef}
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.22em] mb-2">
                <ClipboardList size={14} />
                <span>Assessment Management</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Manage <span className="text-blue-600">Tests</span>
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                {forcedSeriesId
                  ? `Managing tests for: ${selectedSeriesTitle || "Selected Series"}`
                  : "Select a test series, then add/edit tests for it."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => selectedSeriesId && fetchTests(selectedSeriesId)}
                className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50"
                disabled={!selectedSeriesId || loadingTests}
                title="Refresh tests"
              >
                Refresh
              </button>
              <Link
                to="/admin/test-series"
                className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800"
              >
                View Series
              </Link>
            </div>
          </div>

          {!forcedSeriesId && (
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">
                    Test Series
                  </p>

                  {loadingSeries ? (
                    <div className="text-sm text-slate-500">Loading test series...</div>
                  ) : seriesList.length === 0 ? (
                    <div className="text-sm text-slate-500">
                      No test series found.{" "}
                      <Link to="/admin/test-series/create" className="text-blue-600 font-black">
                        Create one
                      </Link>
                    </div>
                  ) : (
                    <div className="relative max-w-2xl">
                      <select
                        value={selectedSeriesId}
                        onChange={(e) => {
                          setSelectedSeriesId(e.target.value);
                          resetForm();
                        }}
                        className="w-full appearance-none rounded-2xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 ring-blue-500/20 font-bold text-slate-700"
                      >
                        {seriesList.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                    <Layers size={16} className="text-slate-400" />
                    <span className="text-sm font-black text-slate-800">
                      {selectedSeriesTitle || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create / Edit Form */}
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  {editId ? <Pencil size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.22em]">
                    {editId ? "Update" : "Create"}
                  </p>
                  <h3 className="text-lg font-black text-slate-900">
                    {editId ? "Edit Test" : "Add New Test"}
                  </h3>
                </div>
              </div>

              {editId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-60"
                  disabled={submitting}
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Subject */}
                <div className="lg:col-span-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Subject
                  </label>

                  {hasSubjects ? (
                    <div className="border border-slate-200 rounded-2xl p-3 bg-white">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap size={16} className="text-slate-400" />
                        <p className="text-xs font-black text-slate-700">Select Subjects</p>
                      </div>

                      <div className="max-h-[180px] overflow-auto pr-1 space-y-2">
                        {subjects.map((s, i) => {
                          const checked = selectedSubjectValues.includes(s);
                          return (
                            <label
                              key={`${s}-${i}`}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const set = new Set(selectedSubjectValues);
                                  if (set.has(s)) set.delete(s);
                                  else set.add(s);
                                  setForm((p) => ({
                                    ...p,
                                    subject: Array.from(set).join(", "),
                                  }));
                                }}
                                className="h-4 w-4"
                                disabled={!selectedSeriesId || submitting}
                              />
                              <span className="text-sm font-bold text-slate-700">{s}</span>
                            </label>
                          );
                        })}
                      </div>

                      {!String(form.subject || "").trim() ? (
                        <p className="mt-2 text-[11px] font-bold text-red-600">
                          Please select at least one subject.
                        </p>
                      ) : (
                        <p className="mt-2 text-[11px] font-bold text-slate-500">
                          Selected: <span className="text-slate-800">{form.subject}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <GraduationCap
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                      />
                      <input
                        value={form.subject}
                        onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                        placeholder="e.g. Maths, Science"
                        required
                        disabled={!selectedSeriesId || submitting}
                      />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="lg:col-span-5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Test Name
                  </label>
                  <div className="relative">
                    <BookOpen
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      placeholder="e.g. Test 1"
                      required
                      disabled={!selectedSeriesId || submitting}
                    />
                  </div>
                </div>

                {/* ScheduledTime */}
                <div className="lg:col-span-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Schedule
                  </label>
                  <div className="relative">
                    <CalendarClock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="datetime-local"
                      value={form.scheduledTime}
                      onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      disabled={!selectedSeriesId || submitting}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="lg:col-span-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Duration (mins)
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      required
                      disabled={!selectedSeriesId || submitting}
                      min={1}
                    />
                  </div>
                </div>

                {/* TotalMarks */}
                <div className="lg:col-span-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Total Marks
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      value={form.totalMarks}
                      onChange={(e) => setForm((p) => ({ ...p, totalMarks: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      required
                      disabled={!selectedSeriesId || submitting}
                      min={0}
                    />
                  </div>
                </div>

                {/* PassingMarks */}
                <div className="lg:col-span-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Passing Marks
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      value={form.passingMarks}
                      onChange={(e) => setForm((p) => ({ ...p, passingMarks: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      required
                      disabled={!selectedSeriesId || submitting}
                      min={0}
                    />
                  </div>
                </div>

                <div className="lg:col-span-12">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 font-semibold">
                    Tip: Subject is required by backend. Scheduled time is optional.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto rounded-2xl px-5 py-3 font-black text-[11px] uppercase tracking-widest border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  disabled={submitting}
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="w-full sm:w-auto rounded-2xl px-6 py-3 font-black text-[11px] uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  {submitting
                    ? editId
                      ? "Updating..."
                      : "Creating..."
                    : editId
                    ? "Update Test"
                    : "Create Test"}
                </button>
              </div>
            </form>
          </div>

          {/* Tests List */}
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Library
                </p>
                <h3 className="text-lg font-black text-slate-900">Tests</h3>
                <p className="text-sm text-slate-500">
                  {selectedSeriesTitle ? `Series: ${selectedSeriesTitle}` : "Select a series to view tests."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-[320px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search tests by name/subject…"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                    disabled={!selectedSeriesId || loadingTests}
                  />
                  {q ? (
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Clear"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>

                <div className="inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-black text-[11px] uppercase tracking-widest">
                  <span>Total</span>
                  <span className="ml-3 text-blue-600">{filteredTests.length}</span>
                </div>
              </div>
            </div>

            {!selectedSeriesId ? (
              <div className="p-10 text-center text-slate-500 font-semibold">Select a series first.</div>
            ) : loadingTests ? (
              <div className="p-10 flex items-center justify-center gap-3 text-slate-500 font-semibold">
                <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                Loading tests...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-semibold">No tests found.</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="block lg:hidden p-4 sm:p-6 space-y-3">
                  {filteredTests.map((t) => (
                    <div
                      key={t._id}
                      className="border border-slate-200 rounded-2xl p-4 hover:shadow-sm transition bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 truncate">{t.name}</p>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            Subject: <span className="text-slate-700">{String(t.subject || "")}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t.duration} mins
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marks</p>
                          <p className="text-sm font-black text-slate-900 mt-1">
                            {t.totalMarks} / {t.passingMarks}
                          </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{fmtDateTime(t.scheduledTime)}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to={`/admin/questions/${t._id}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700"
                        >
                          Manage Questions
                        </Link>

                        <button
                          onClick={() => handleEdit(t)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteClick(t._id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 text-[11px] font-black uppercase tracking-widest hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white border-b border-slate-100">
                      <tr className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-6 py-4 text-left">Name</th>
                        <th className="px-6 py-4 text-left">Subject</th>
                        <th className="px-6 py-4 text-left">Schedule</th>
                        <th className="px-6 py-4 text-left">Marks</th>
                        <th className="px-6 py-4 text-left">Duration</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredTests.map((t) => (
                        <tr key={t._id} className="hover:bg-blue-50/30 transition">
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900">{t.name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{String(t.subject || "")}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">{fmtDateTime(t.scheduledTime)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900">
                              {t.totalMarks}{" "}
                              <span className="text-slate-400 font-bold">/</span>{" "}
                              {t.passingMarks}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                              <Clock size={14} className="text-slate-400" />
                              {t.duration} mins
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                to={`/admin/questions/${t._id}`}
                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700"
                              >
                                Manage Questions
                              </Link>

                              <button
                                onClick={() => handleEdit(t)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-slate-700 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteClick(t._id)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 text-[11px] font-black uppercase tracking-widest hover:bg-red-100"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Showing {filteredTests.length} tests
                  </p>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Tip: Use search to filter quickly
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Test"
        description="Are you sure you want to delete this test? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        danger
        loading={deleteLoading}
        onCancel={() => {
          if (deleteLoading) return;
          setConfirmOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

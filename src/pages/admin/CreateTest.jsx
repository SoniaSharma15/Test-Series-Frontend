// src/pages/admin/CreateTest.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../../services/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import {
  Plus,
  Trash2,
  Eye,
  BookOpen,
  Clock,
  Target,
  Calendar,
  AlertCircle,
  ListChecks,
  Search,
  RefreshCcw,
  ChevronDown,
  ShieldCheck,
  X,
} from "lucide-react";

function useDebounce(value, delay = 300) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
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

export default function CreateTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcedSeriesId = searchParams.get("seriesId");

  const [seriesList, setSeriesList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tests, setTests] = useState([]);

  // ✅ subject -> subjects[] (multi)
  const [form, setForm] = useState({
    testSeriesId: forcedSeriesId || "",
    subjects: [],
    name: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    scheduledTime: "",
  });

  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState("");

  // ✅ list search/sort
  const [q, setQ] = useState("");
  const debQ = useDebounce(q, 250);
  const [sort, setSort] = useState("latest"); // latest | name | schedule

  // ✅ confirm delete dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const fetchSeries = async () => {
  setLoadingSeries(true);
  setErr("");

  try {
    const res = await axios.get("/test-series");
    const list = Array.isArray(res.data) ? res.data : [];
    setSeriesList(list);

    if (forcedSeriesId) {
      const selected = list.find((s) => s._id === forcedSeriesId);
      setSubjects(selected?.subjects || []);
      setForm((p) => ({ ...p, testSeriesId: forcedSeriesId, subjects: [] }));
      await fetchTests(forcedSeriesId);
    }
  } catch (e) {
    setErr("Failed to load test series");
    toast.error("Failed to load test series");
  } finally {
    setLoadingSeries(false);
  }
};

const fetchTests = async (seriesId) => {
  if (!seriesId) return;

  setLoadingTests(true);
  setErr("");

  try {
    const res = await axios.get(`/tests/by-series/${seriesId}`);
    setTests(Array.isArray(res.data) ? res.data : []);
  } catch (e) {
    setErr("Failed to load tests");
    toast.error("Failed to load tests");
  } finally {
    setLoadingTests(false);
  }
};

  const handleSeriesChange = async (id) => {
    const selected = seriesList.find((s) => s._id === id);
    setSubjects(selected?.subjects || []);
    setForm((p) => ({ ...p, testSeriesId: id, subjects: [] }));
    await fetchTests(id);
  };

  const selectedSeriesTitle = useMemo(() => {
    if (!form.testSeriesId) return "";
    return seriesList.find((s) => s._id === form.testSeriesId)?.title || "";
  }, [form.testSeriesId, seriesList]);

  const stats = useMemo(() => {
    const total = tests.length;
    const scheduled = tests.filter((t) => t.scheduledTime).length;
    const subjectsCount = subjects?.length || 0;
    return { total, scheduled, subjectsCount };
  }, [tests, subjects]);

  const canCreate = useMemo(() => {
    if (!form.testSeriesId) return false;
    if (!String(form.name || "").trim()) return false;
    if (!Array.isArray(form.subjects) || form.subjects.length === 0) return false;
    if (!String(form.duration || "").trim()) return false;
    if (!String(form.totalMarks || "").trim()) return false;
    if (!String(form.passingMarks || "").trim()) return false;
    return true;
  }, [form]);

  const handleCreateTest = async () => {
    setErr("");

    if (!canCreate) {
      toast.error("Please fill all required fields");
      return;
    }

    setCreating(true);
    try {
      // ✅ Backend change nahi: subject string hi bhejna
      const payload = {
        ...form,
        subject: (form.subjects || []).join(", "),
        duration: Number(form.duration),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks),
        scheduledTime: form.scheduledTime
          ? new Date(form.scheduledTime).toISOString()
          : undefined,
      };

      delete payload.subjects;
      if (!payload.scheduledTime) delete payload.scheduledTime;

      await axios.post("/tests", payload);

      toast.success("Test created");
      await fetchTests(form.testSeriesId);

      setForm((p) => ({
        ...p,
        subjects: [],
        name: "",
        duration: "",
        totalMarks: "",
        passingMarks: "",
        scheduledTime: "",
      }));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to create test");
      toast.error(e?.response?.data?.message || "Failed to create test");
    } finally {
      setCreating(false);
    }
  };

  // ✅ delete dialog open
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
      await fetchTests(form.testSeriesId);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete test");
    } finally {
      setDeleteLoading(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const filteredTests = useMemo(() => {
    const list = Array.isArray(tests) ? tests : [];
    const qq = String(debQ || "").trim().toLowerCase();

    let out = !qq
      ? list
      : list.filter((t) => {
          const name = String(t?.name || "").toLowerCase();
          const sub = String(t?.subject || "").toLowerCase();
          return name.includes(qq) || sub.includes(qq);
        });

    if (sort === "name") {
      out = [...out].sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || ""))
      );
    } else if (sort === "schedule") {
      out = [...out].sort((a, b) => {
        const ad = a?.scheduledTime ? new Date(a.scheduledTime).getTime() : 0;
        const bd = b?.scheduledTime ? new Date(b.scheduledTime).getTime() : 0;
        return bd - ad;
      });
    } else {
      out = [...out].sort((a, b) => {
        const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
    }

    return out;
  }, [tests, debQ, sort]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-600">
                Test Administration
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Create & Manage <span className="text-blue-600">Tests</span>
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Create tests under a series, schedule them, and manage questions.
              </p>

              {forcedSeriesId ? (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2 rounded-2xl">
                  <ShieldCheck size={14} />
                  Series Locked:{" "}
                  <span className="text-slate-700">
                    {selectedSeriesTitle || "Selected"}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => form.testSeriesId && fetchTests(form.testSeriesId)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-slate-700 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50"
                disabled={!form.testSeriesId || loadingTests}
              >
                <RefreshCcw size={14} />
                Refresh
              </button>

              <button
                onClick={handleCreateTest}
                disabled={!canCreate || creating}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                {creating ? "Creating..." : "Create Test"}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {err ? (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3">
              <AlertCircle size={18} />
              <p className="text-sm font-semibold">{err}</p>
            </div>
          ) : null}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Tests" value={stats.total} />
            <StatCard label="Scheduled" value={stats.scheduled} />
            <StatCard label="Subjects" value={stats.subjectsCount} />
            <StatCard label="Series" value={form.testSeriesId ? 1 : 0} />
          </div>

          {/* Create Form Card */}
          <section className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40">
              <h2 className="text-lg font-black text-slate-900">Test Builder</h2>
              <p className="text-sm text-slate-500 mt-1">
                Fill required fields and create a new test.
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Series select */}
              {!forcedSeriesId ? (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Test Series
                  </label>

                  {loadingSeries ? (
                    <div className="text-sm text-slate-500">Loading series…</div>
                  ) : (
                    <div className="relative max-w-3xl">
                      <select
                        className="w-full appearance-none rounded-2xl border border-slate-200 px-4 py-3 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                        value={form.testSeriesId}
                        onChange={(e) => handleSeriesChange(e.target.value)}
                      >
                        <option value="">Select Test Series</option>
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
              ) : null}

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Subject Multi */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <SubjectMultiSelect
                    options={subjects || []}
                    value={form.subjects || []}
                    disabled={!form.testSeriesId}
                    onChange={(next) =>
                      setForm((p) => ({ ...p, subjects: next }))
                    }
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ListChecks
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Maths Test 1"
                      className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      disabled={!form.testSeriesId}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Duration (mins) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="60"
                      className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      value={form.duration}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, duration: e.target.value }))
                      }
                      disabled={!form.testSeriesId}
                    />
                  </div>
                </div>

                {/* Total Marks */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Target
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      min={0}
                      placeholder="100"
                      className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      value={form.totalMarks}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          totalMarks: e.target.value,
                        }))
                      }
                      disabled={!form.testSeriesId}
                    />
                  </div>
                </div>

                {/* Passing Marks */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Passing Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="33"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                    value={form.passingMarks}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        passingMarks: e.target.value,
                      }))
                    }
                    disabled={!form.testSeriesId}
                  />
                </div>

                {/* Scheduled */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Scheduled Time (optional)
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="datetime-local"
                      className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                      value={form.scheduledTime}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          scheduledTime: e.target.value,
                        }))
                      }
                      disabled={!form.testSeriesId}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 font-semibold">
                Tip: Create the test first, then open{" "}
                <span className="font-black text-slate-900">
                  Manage Questions
                </span>
                .
              </div>
            </div>
          </section>

          {/* Existing Tests */}
          <section className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-100 bg-slate-50/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Existing Tests
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {form.testSeriesId
                    ? `Series: ${selectedSeriesTitle || "Selected"}`
                    : "Select a series to view tests."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-[320px]">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search tests by name/subject…"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                    disabled={!form.testSeriesId || loadingTests}
                  />
                </div>

                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full sm:w-[180px] rounded-2xl border border-slate-200 px-4 py-3 bg-white font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20"
                  disabled={!form.testSeriesId || loadingTests}
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="name">Sort: Name</option>
                  <option value="schedule">Sort: Schedule</option>
                </select>
              </div>
            </div>

            {!form.testSeriesId ? (
              <div className="p-10 text-center text-slate-500 font-semibold">
                Select a test series to see tests.
              </div>
            ) : loadingTests ? (
              <div className="p-10 flex items-center justify-center gap-3 text-slate-500 font-semibold">
                <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
                Loading tests...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-semibold">
                No tests found.
              </div>
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
                          <p className="font-black text-slate-900 truncate">
                            {t.name}
                          </p>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            Subject:{" "}
                            <span className="text-slate-700">
                              {t.subject || "—"}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t.duration || 0} mins
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Marks
                          </p>
                          <p className="text-sm font-black text-slate-900 mt-1">
                            {t.passingMarks}/{t.totalMarks}
                          </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Schedule
                          </p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {fmtDateTime(t.scheduledTime)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/admin/test/${t._id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700"
                        >
                          <Eye size={14} />
                          Details
                        </button>

                        <button
                          onClick={() => navigate(`/admin/questions/${t._id}`)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 px-4 py-2.5 text-blue-700 text-[11px] font-black uppercase tracking-widest hover:bg-blue-50"
                        >
                          <BookOpen size={14} />
                          Questions
                        </button>

                        <button
                          onClick={() => handleDeleteClick(t._id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700 text-[11px] font-black uppercase tracking-widest hover:bg-red-100"
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
                        <tr
                          key={t._id}
                          className="hover:bg-blue-50/30 transition"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900">
                              {t.name}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">
                              {t.subject || "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700">
                              {fmtDateTime(t.scheduledTime)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900">
                              {t.passingMarks}
                              <span className="text-slate-400 font-bold">
                                {" "}
                                /{" "}
                              </span>
                              {t.totalMarks}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                              <Clock size={14} className="text-slate-400" />
                              {t.duration || 0} mins
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/admin/test/${t._id}`)}
                                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-white text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700"
                              >
                                <Eye size={14} />
                                Details
                              </button>

                              <button
                                onClick={() =>
                                  navigate(`/admin/questions/${t._id}`)
                                }
                                className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 px-4 py-2.5 text-blue-700 text-[11px] font-black uppercase tracking-widest hover:bg-blue-50"
                              >
                                <BookOpen size={14} />
                                Questions
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
                    Tip: Use search + sort
                  </p>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ✅ Confirm delete dialog */}
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
      </main>
    </div>
  );
}

/* ------------------ Multi Select Component ------------------ */
function SubjectMultiSelect({ options = [], value = [], onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // ✅ click outside close
  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const toggle = (sub) => {
    const set = new Set(value || []);
    if (set.has(sub)) set.delete(sub);
    else set.add(sub);
    onChange(Array.from(set));
  };

  const removeOne = (sub) => onChange((value || []).filter((x) => x !== sub));
  const clearAll = () => onChange([]);

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={[
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3",
          "font-bold text-slate-700 focus:outline-none focus:ring-2 ring-blue-500/20",
          "flex items-center justify-between gap-3",
          disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <BookOpen className="text-slate-400 shrink-0" size={16} />
          {!value || value.length === 0 ? (
            <span className="text-slate-400 font-bold">Select Subjects</span>
          ) : (
            <span className="text-slate-800 font-black truncate">
              {value.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {value?.length ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600"
            >
              Clear
            </button>
          ) : null}
          <ChevronDown className="text-slate-400" size={18} />
        </div>
      </button>

      {/* Selected chips */}
      {value?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-black text-blue-700"
            >
              {s}
              <button
                type="button"
                onClick={() => removeOne(s)}
                className="text-blue-700/70 hover:text-blue-900"
                aria-label={`Remove ${s}`}
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {/* Dropdown */}
      {open && !disabled ? (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-auto p-2">
            {options.length === 0 ? (
              <div className="p-3 text-sm font-bold text-slate-500">
                No subjects
              </div>
            ) : (
              options.map((sub) => {
                const checked = (value || []).includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggle(sub)}
                    className={[
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl",
                      "text-sm font-bold",
                      checked
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 text-slate-700",
                    ].join(" ")}
                  >
                    <span className="truncate">{sub}</span>
                    <span
                      className={[
                        "h-5 w-5 rounded-md border flex items-center justify-center",
                        checked
                          ? "border-blue-300 bg-blue-600 text-white"
                          : "border-slate-300 bg-white",
                      ].join(" ")}
                    >
                      {checked ? "✓" : ""}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 p-2 flex items-center justify-end gap-2 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------ Small UI Card ------------------ */
function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

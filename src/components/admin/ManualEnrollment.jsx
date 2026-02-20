import { useState } from "react";
import axios from "../../services/axiosInstance";
import {
  UserPlus,
  Search,
  User,
  Mail,
  BookOpen,
  ArrowRight,
  RefreshCw
} from "lucide-react";

export default function ManualEnrollment({ seriesList }) {
  /* ---------------- STATE ---------------- */
  const [assignEmail, setAssignEmail] = useState("");
  const [assignStudent, setAssignStudent] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSearching, setAssignSearching] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignMessage, setAssignMessage] = useState("");

  /* ================= SEARCH STUDENT ================= */
  const searchAssignStudent = async () => {
    if (!assignEmail.trim()) {
      setAssignError("Please enter student email");
      return;
    }

    setAssignSearching(true);
    setAssignError("");
    setAssignMessage("");
    setAssignStudent(null);

    try {
      const res = await axios.get(
        `/user/student-by-email?email=${assignEmail}`
      );

      const student = res.data.data || res.data;
      setAssignStudent(student);
      setAssignMessage("Student found successfully");
    } catch (error) {
      if (error.response?.status === 404) {
        setAssignError("Student not found");
      } else {
        setAssignError("Failed to search student");
      }
      setAssignStudent(null);
    } finally {
      setAssignSearching(false);
    }
  };

  /* ================= ASSIGN COURSE ================= */
  const handleAssign = async () => {
    if (!selectedSeries) {
      setAssignError("Select test series");
      return;
    }

    if (!assignStudent?._id) {
      setAssignError("Search student first");
      return;
    }

    setAssignLoading(true);
    setAssignError("");
    setAssignMessage("");

    try {
      await axios.post("/user/assign-test-series", {
        studentId: assignStudent._id,
        testSeriesId: selectedSeries,
      });

      setAssignMessage("Course Assigned Successfully");
    } catch (error) {
      if (error.response?.status === 409) {
        setAssignError("Course already assigned to this student");
      } else {
        setAssignError("Failed to assign course");
      }
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
        <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
          <UserPlus size={20} />
        </div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
          Manual Enrollment
        </h2>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6 flex-1">

        {/* Messages */}
        {assignError && (
          <div className="text-red-600 text-xs font-bold">{assignError}</div>
        )}

        {assignMessage && (
          <div className="text-green-600 text-xs font-bold">{assignMessage}</div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Target Account Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="email"
              placeholder="student@example.com"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={searchAssignStudent}
          disabled={assignSearching}
          className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {assignSearching ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          Identity Lookup
        </button>

        {/* Student Info */}
        {assignStudent && (
          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {assignStudent.name}
              </p>
              <p className="text-[11px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">
                Verified Student
              </p>
            </div>
          </div>
        )}

        {/* Series Select + Assign Button */}
        {assignStudent && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Select Academic Series
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    setAssignError("");
                    setAssignMessage("");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 appearance-none cursor-pointer"
                >
                  <option value="">Choose Catalog...</option>
                  {seriesList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAssign}
              disabled={assignLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {assignLoading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  Grant Access <ArrowRight size={18} />
                </>
              )}
            </button>

          </div>
        )}
      </div>
    </section>
  );
}

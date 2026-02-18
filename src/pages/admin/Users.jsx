import { useState, useEffect } from "react";
import axios from "../../services/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import {
  UserPlus,
  KeyRound,
  Search,
  User,
  Mail,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  XCircle,
  UserCog
} from "lucide-react";

export default function Users() {
  const [seriesList, setSeriesList] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  /* ---------------- ASSIGN COURSE STATE ---------------- */
  const [assignEmail, setAssignEmail] = useState("");
  const [assignStudent, setAssignStudent] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSearching, setAssignSearching] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignMessage, setAssignMessage] = useState("");

  /* ---------------- RESET PASSWORD STATE ---------------- */
  const [resetEmail, setResetEmail] = useState("");
  const [resetStudent, setResetStudent] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSearching, setResetSearching] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  /* ---------------- CREATE USER STATE ---------------- */
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPasswordCreate, setNewPasswordCreate] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newSelectedSeries, setNewSelectedSeries] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createMessage, setCreateMessage] = useState("");


  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await axios.get("/test-series");
      setSeriesList(res.data);
    } catch (err) {
      console.error("Failed to fetch series:", err);
    }
  };

  const handleCreateUser = async () => {
    if (!newName || !newEmail || !newPasswordCreate) {
      setCreateError("All fields are required");
      return;
    }

    if (newPasswordCreate.length < 6) {
      setCreateError("Password must be at least 6 characters");
      return;
    }

    setCreateLoading(true);
    setCreateError("");
    setCreateMessage("");

    try {
      await axios.post("/user/create-user", {
        name: newName,
        email: newEmail,
        password: newPasswordCreate,
        role: newRole,
        testSeriesId:
          newRole === "student" ? newSelectedSeries : null,
      });

      setCreateMessage("User created successfully");
      setNewName("");
      setNewEmail("");
      setNewPasswordCreate("");
      setNewSelectedSeries("");

    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Failed to create user"
      );
    } finally {
      setCreateLoading(false);
    }
  };


  /* ================= SEARCH ASSIGN STUDENT ================= */
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

  /* ================= SEARCH RESET STUDENT ================= */
  const searchResetStudent = async () => {
    if (!resetEmail.trim()) {
      setResetError("Please enter student email");
      return;
    }

    setResetSearching(true);
    setResetError("");
    setResetMessage("");
    setResetStudent(null);

    try {
      const res = await axios.get(
        `/user/student-by-email?email=${resetEmail}`
      );

      const student = res.data.data || res.data;
      setResetStudent(student);
      setResetMessage("Student found successfully");
    } catch (error) {
      if (error.response?.status === 404) {
        setResetError("Student not found");
      } else {
        setResetError("Failed to search student");
      }
      setResetStudent(null);
    } finally {
      setResetSearching(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setResetError("Enter new password");
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }

    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      await axios.put("/user/change-password", {
        studentId: resetStudent._id,
        newPassword,
      });

      setResetMessage("Password Reset Successfully");
      setNewPassword("");
    } catch {
      setResetError("Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12">

          {/* Header Section */}
          <header className="mb-12">
            <div className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
              <ShieldCheck size={14} />
              <span>Security & Access Control</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              User <span className="text-blue-600">Governance</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Manage student access levels and account security parameters.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ================= CREATE USER TOOLKIT ================= */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-200">
                  <UserCog size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                  Create User & Assign Course
                </h2>
              </div>

              <div className="p-8 space-y-6">

                {createError && (
                  <div className="text-red-600 text-xs font-bold">{createError}</div>
                )}

                {createMessage && (
                  <div className="text-green-600 text-xs font-bold">{createMessage}</div>
                )}

                {/* Name */}
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600"
                />

                {/* Email */}
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600"
                />

                {/* Password */}
                <input
                  type="password"
                  placeholder="Password"
                  value={newPasswordCreate}
                  onChange={(e) => setNewPasswordCreate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600"
                />

                {/* Role */}
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Course Select (Only if Student) */}
                {newRole === "student" && (
                  <select
                    value={newSelectedSeries}
                    onChange={(e) => setNewSelectedSeries(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-purple-600"
                  >
                    <option value="">Assign Course (Optional)</option>
                    {seriesList.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={handleCreateUser}
                  disabled={createLoading}
                  className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create Account"}
                </button>

              </div>
            </section>


            {/* ================= ASSIGN COURSE TOOLKIT ================= */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
                    <UserPlus size={20} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Manual Enrollment</h2>
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1">

                {assignError && (
                  <div className="text-red-600 text-xs font-bold">{assignError}</div>
                )}

                {assignMessage && (
                  <div className="text-green-600 text-xs font-bold">{assignMessage}</div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={assignEmail}
                      onChange={(e) => setAssignEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={searchAssignStudent}
                  disabled={assignSearching}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {assignSearching ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                  Identity Lookup
                </button>

                {assignStudent && (
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95 duration-300">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{assignStudent.name}</p>
                      <p className="text-[11px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">Verified Student</p>
                    </div>
                  </div>
                )}

                {assignStudent && (
                  <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Academic Series</label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                            <option key={s._id} value={s._id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleAssign}
                      disabled={assignLoading}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {assignLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Grant Access <ArrowRight size={18} /></>}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ================= RESET PASSWORD TOOLKIT ================= */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-lg shadow-red-100">
                    <KeyRound size={20} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">Credential Reset</h2>
                </div>
              </div>

              <div className="p-8 space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      placeholder="student@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-red-500/10 focus:border-red-600 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={searchResetStudent}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Search size={14} /> Find Account
                </button>

                {resetStudent && (
                  <div className="p-5 bg-red-50/50 border border-red-100 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95 duration-300">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{resetStudent.name}</p>
                      <p className="text-[11px] font-bold text-red-600 mt-1 uppercase tracking-tighter">Identity Locked</p>
                    </div>
                  </div>
                )}

                {resetStudent && (
                  <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-red-600 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                      className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {resetLoading ? <RefreshCw className="animate-spin" size={18} /> : <>Override Credentials <ShieldCheck size={18} /></>}
                    </button>
                  </div>
                )}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}

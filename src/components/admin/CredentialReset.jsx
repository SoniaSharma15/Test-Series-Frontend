import { useState } from "react";
import axios from "../../services/axiosInstance";
import toast from "react-hot-toast";
import {
  KeyRound,
  Search,
  User,
  Mail,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

export default function CredentialReset() {
  /* ---------------- STATE ---------------- */
  const [resetEmail, setResetEmail] = useState("");
  const [resetStudent, setResetStudent] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [resetLoading, setResetLoading] = useState(false);
  const [resetSearching, setResetSearching] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  /* ================= SEARCH STUDENT ================= */
const searchResetStudent = async () => {
  if (!resetEmail.trim()) {
    setResetError("Please enter student email");
    toast.error("Please enter student email ❌");
    return;
  }

  let loadingToast;

  try {
    setResetSearching(true);
    setResetError("");
    setResetMessage("");
    setResetStudent(null);

    loadingToast = toast.loading("Searching student...");

    const res = await axios.get(
      `/user/student-by-email?email=${resetEmail}`
    );

    const student = res.data.data || res.data;

    toast.dismiss(loadingToast);
    toast.success("Student found successfully ✅");

    setResetStudent(student);
    setResetMessage("Student found successfully");

  } catch (error) {
    toast.dismiss(loadingToast);

    if (error.response?.status === 404) {
      setResetError("Student not found");
      toast.error("Student not found ❌");
    } else {
      setResetError("Failed to search student");
      toast.error("Failed to search student ❌");
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
    toast.error("Enter new password ❌");
    return;
  }

  if (newPassword.length < 6) {
    setResetError("Password must be at least 6 characters");
    toast.error("Password must be at least 6 characters ❌");
    return;
  }

  if (!resetStudent?._id) {
    setResetError("Search student first");
    toast.error("Search student first ❌");
    return;
  }

  let loadingToast;

  try {
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    loadingToast = toast.loading("Resetting password...");

    await axios.put("/user/change-password", {
      studentId: resetStudent._id,
      newPassword,
    });

    toast.dismiss(loadingToast);
    toast.success("Password Reset Successfully 🔐");

    setResetMessage("Password Reset Successfully");
    setNewPassword("");

  } catch (error) {
    toast.dismiss(loadingToast);

    const errorMessage =
      error.response?.data?.message || "Failed to reset password ❌";

    setResetError(errorMessage);
    toast.error(errorMessage);

  } finally {
    setResetLoading(false);
  }
};

  return (
    <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
        <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-lg shadow-red-200">
          <KeyRound size={20} />
        </div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">
          Credential Reset
        </h2>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6 flex-1">

        {/* Messages */}
        {resetError && (
          <div className="text-red-600 text-xs font-bold">{resetError}</div>
        )}

        {resetMessage && (
          <div className="text-green-600 text-xs font-bold">{resetMessage}</div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Account Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="email"
              placeholder="student@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-red-500/10 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={searchResetStudent}
          disabled={resetSearching}
          className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {resetSearching ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
          Find Account
        </button>

        {/* Student Info */}
        {resetStudent && (
          <div className="p-5 bg-red-50/50 border border-red-100 rounded-[2rem] flex items-center gap-4 animate-in zoom-in-95 duration-300">
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100">
              <User size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {resetStudent.name}
              </p>
              <p className="text-[11px] font-bold text-red-600 mt-1 uppercase tracking-tighter">
                Identity Locked
              </p>
            </div>
          </div>
        )}

        {/* New Password Section */}
        {resetStudent && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                New Secure Password
              </label>
              <div className="relative">
                <KeyRound
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
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
              {resetLoading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  Override Credentials <ShieldCheck size={18} />
                </>
              )}
            </button>

          </div>
        )}
      </div>
    </section>
  );
}

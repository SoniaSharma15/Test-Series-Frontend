import { useMemo, useState } from "react";
import { Calendar, BadgeCheck, BadgeDollarSign, ShieldAlert, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import { renewEnrollment } from "../../services/enrollmentService";

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  const d = new Date(expiryDate);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

export default function EnrollmentTable({ enrollments = [], getStatusBadge, onRenewed }) {
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [renewDays, setRenewDays] = useState(30);
  const [activeRow, setActiveRow] = useState(null);

  const rows = useMemo(() => (Array.isArray(enrollments) ? enrollments : []), [enrollments]);

  const openRenew = (row) => {
    const fallback = Number(row?.testSeriesId?.duration || 30);
    setRenewDays(fallback);
    setActiveRow(row);
    setRenewOpen(true);
  };

  const closeRenew = () => {
    if (renewLoading) return;
    setRenewOpen(false);
    setActiveRow(null);
  };

  const confirmRenew = async () => {
    if (!activeRow?._id) return;

    setRenewLoading(true);
    try {
      await renewEnrollment(activeRow._id, renewDays);
      toast.success("Renewed successfully");
      closeRenew();
      onRenewed?.();
    } catch (e) {
      toast.error("Renew failed");
    } finally {
      setRenewLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-slate-900">Recent Enrollments</h3>
          <p className="text-sm font-semibold text-slate-500">
            Student, series, access & payment metadata
          </p>
        </div>

        <div className="text-xs font-black uppercase tracking-widest text-slate-400">
          Records: {rows.length}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold">
          No enrollments found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          <table className="min-w-[1100px] w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Series</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">PaymentId</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((enroll) => {
                const expired = isExpired(enroll.expiryDate);
                const access = Boolean(enroll.accessGranted);
                const source = enroll.source || "—";

                return (
                  <tr key={enroll._id} className="hover:bg-blue-50/30 transition">
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black text-xs">
                          {String(enroll.studentId?.name || "?").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">
                            {enroll.studentId?.name || "—"}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 truncate">
                            {enroll.studentId?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Series */}
                    <td className="px-2 py-4">
                      <p className="text-sm font-bold text-slate-700">
                        {enroll.testSeriesId?.title || "—"}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        Duration: {Number(enroll.testSeriesId?.duration || 0)} days
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-900">
                        ₹{Number(enroll.amount || 0)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge?.(enroll.status)}`}>
                        {enroll.status || "—"}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                        {source === "admin" ? <BadgeCheck size={16} className="text-slate-400" /> : <BadgeDollarSign size={16} className="text-slate-400" />}
                        {source}
                      </span>
                    </td>

                    {/* PaymentId */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-600">
                        {enroll.paymentId || "—"}
                      </span>
                    </td>

                    {/* Access */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${access ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                        {access ? "granted" : "revoked"}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 text-sm font-bold ${expired ? "text-red-700" : "text-slate-600"}`}>
                        {expired ? <ShieldAlert size={16} className="text-red-500" /> : <Calendar size={16} className="text-slate-400" />}
                        {enroll.expiryDate ? new Date(enroll.expiryDate).toLocaleDateString() : "—"}
                      </div>
                      {expired ? (
                        <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-red-500">
                          EXPIRED
                        </div>
                      ) : null}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {(expired || !access) ? (
                          <button
                            onClick={() => openRenew(enroll)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs hover:bg-red-700"
                            title="Renew access"
                          >
                            <RotateCcw size={16} />
                            Renew
                          </button>
                        ) : (
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Renew Modal */}
      {renewOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeRenew} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h4 className="text-xl font-black text-slate-900">Renew Enrollment</h4>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Extend access for <span className="text-slate-900">{activeRow?.studentId?.name || "student"}</span>
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Series</p>
                <p className="text-sm font-black text-slate-900 mt-1">
                  {activeRow?.testSeriesId?.title || "—"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Days</p>
                <input
                  type="number"
                  min={1}
                  value={renewDays}
                  onChange={(e) => setRenewDays(Math.max(1, Number(e.target.value || 1)))}
                  className="mt-2 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeRenew}
                disabled={renewLoading}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={confirmRenew}
                disabled={renewLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 disabled:opacity-60"
              >
                {renewLoading ? "Renewing..." : "Confirm Renew"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

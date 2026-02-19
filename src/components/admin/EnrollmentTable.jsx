import { useMemo } from "react";
import { BadgeCheck, BadgeDollarSign } from "lucide-react";

export default function EnrollmentTable({ enrollments = [], getStatusBadge }) {
  const rows = useMemo(() => (Array.isArray(enrollments) ? enrollments : []), [enrollments]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-slate-900">Recent Enrollments</h3>
          <p className="text-sm font-semibold text-slate-500">
            Student, series, payment metadata
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
          <table className="min-w-[950px] w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-widest font-black">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Series</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">PaymentId</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((enroll) => {
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
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge?.(
                          enroll.status
                        )}`}
                      >
                        {enroll.status || "—"}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                        {source === "admin" ? (
                          <BadgeCheck size={16} className="text-slate-400" />
                        ) : (
                          <BadgeDollarSign size={16} className="text-slate-400" />
                        )}
                        {source}
                      </span>
                    </td>

                    {/* PaymentId */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-600">
                        {enroll.paymentId || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

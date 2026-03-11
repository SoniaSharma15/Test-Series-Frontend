import { Trophy } from "lucide-react";

export default function Leaderboard({ leaderboard = [], currentUserId }) {
  return (
    <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#f8fafc] px-4 md:px-6 py-4 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm md:text-base">
          <Trophy size={18} className="text-amber-500" />
          TOP 10 LEADERBOARD
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-3 font-bold">Rank</th>
              <th className="px-6 py-3 font-bold">Name</th>
              <th className="px-6 py-3 font-bold">Avg Score</th>
              <th className="px-6 py-3 font-bold">Success Rate</th>
              <th className="px-6 py-3 font-bold">Attempts</th>
              <th className="px-6 py-3 font-bold">Highest</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {leaderboard.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-8 text-center text-slate-500 font-medium"
                >
                  No leaderboard data available
                </td>
              </tr>
            ) : (
              leaderboard.map((student) => {
                const isCurrentUser = student.studentId === currentUserId;

                return (
                  <tr
                    key={student.studentId}
                    className={`transition-colors ${
                      isCurrentUser ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {student.rank === 1
                        ? "🥇 #1"
                        : student.rank === 2
                          ? "🥈 #2"
                          : student.rank === 3
                            ? "🥉 #3"
                            : `#${student.rank}`}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        {student.name}
                        {isCurrentUser && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                            YOU
                          </span>
                        )}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {student.averageScore}
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {student.successRate}%
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {student.totalAttempts}
                    </td>

                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {student.highestScore}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
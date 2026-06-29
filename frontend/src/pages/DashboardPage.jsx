import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { API } from '../api/config'

function StatCard({ value, label, icon, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className={`text-2xl font-black ${color}`}>{value ?? '—'}</p>
      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
    </div>
  )
}

function SkeletonBar() {
  return <div className="h-4 bg-gray-200 rounded-full animate-pulse w-full" />
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/stats/overview`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const barData = stats?.recent_activity?.map(r => ({
    day:   r.day.slice(5),   // MM-DD
    count: r.count,
  })) ?? []

  // Điền ngày thiếu trong 7 ngày
  const filledBar = (() => {
    const result = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const found = barData.find(r => r.day === key)
      result.push({ day: key, count: found?.count ?? 0 })
    }
    return result
  })()

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">📊 Tổng quan học tập</h1>

      {/* Khu vực 1 — 4 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon="📖" color="text-red-600"
          value={loading ? '…' : stats?.total_words_learned}
          label="Từ đã thuộc" />
        <StatCard
          icon="🎯" color="text-blue-600"
          value={loading ? '…' : (stats?.quiz_accuracy ? `${stats.quiz_accuracy}%` : '—')}
          label="Quiz chính xác" />
        <StatCard
          icon="✍️" color="text-purple-600"
          value={loading ? '…' : (stats?.writing_avg_score ? `${stats.writing_avg_score}đ` : '—')}
          label="TB đặt câu" />
        <StatCard
          icon="🔥" color="text-orange-500"
          value={loading ? '…' : `${stats?.study_streak ?? 0} ngày`}
          label="Streak liên tiếp" />
      </div>

      {/* Khu vực 2 — Tiến độ HSK */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5">
        <h2 className="font-bold text-gray-700 mb-4">Tiến độ HSK</h2>
        {loading
          ? <div className="space-y-3">{Array(6).fill(0).map((_,i) => <SkeletonBar key={i} />)}</div>
          : (stats?.hsk_progress ?? []).map(h => (
            <div key={h.level} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700">HSK {h.level}</span>
                <span className="text-gray-400">{h.learned} / {h.total} từ</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C0392B] rounded-full transition-all duration-700"
                  style={{ width: `${h.percent}%` }}
                />
              </div>
              <p className="text-right text-xs text-gray-400 mt-0.5">{h.percent}%</p>
            </div>
          ))
        }
      </div>

      {/* Khu vực 3 — Biểu đồ 7 ngày */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5">
        <h2 className="font-bold text-gray-700 mb-4">Hoạt động 7 ngày gần nhất</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={filledBar} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              formatter={(v) => [`${v} từ`, 'Đã ôn']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="count" radius={[4,4,0,0]}>
              {filledBar.map((_, i) => (
                <Cell key={i} fill={_.count > 0 ? '#C0392B' : '#e5e7eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Khu vực 4 — Từ cần ôn lại */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Từ hay sai nhất</h2>
        </div>
        {loading && (
          <div className="p-4 space-y-2">{Array(5).fill(0).map((_,i) => <SkeletonBar key={i} />)}</div>
        )}
        {!loading && (stats?.weak_words ?? []).length === 0 && (
          <p className="text-gray-400 text-sm px-5 py-8 text-center">Chưa có dữ liệu. Hãy luyện tập thêm!</p>
        )}
        {!loading && (stats?.weak_words ?? []).map((w, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
            <span className="text-gray-300 text-sm w-5">{i + 1}</span>
            <span className="font-hanzi text-xl text-gray-800 w-12">{w.chinese}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-500">{w.pinyin}</p>
              <p className="text-xs text-gray-500 truncate">{w.vietnamese}</p>
            </div>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">HSK {w.hsk_level}</span>
          </div>
        ))}
        {!loading && (stats?.weak_words ?? []).length > 0 && (
          <div className="px-5 py-3">
            <button
              onClick={() => window.location.href = '/flashcard'}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold">
              📚 Ôn ngay
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

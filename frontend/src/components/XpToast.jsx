import { useEffect, useState } from 'react'

let listeners = []
export function showXpToast(payload) {
  listeners.forEach(fn => fn(payload))
}

const CSS = `
@keyframes xpSlideIn {
  from { opacity:0; transform:translateX(40px) scale(0.9); }
  to   { opacity:1; transform:translateX(0)     scale(1); }
}
@keyframes badgePop {
  0%   { opacity:0; transform:scale(0.5) rotate(-8deg); }
  60%  { opacity:1; transform:scale(1.08) rotate(2deg); }
  100% { opacity:1; transform:scale(1)    rotate(0deg); }
}
.xp-toast      { animation: xpSlideIn 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.badge-toast   { animation: badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
`

export function XpToastHost() {
  const [queue, setQueue] = useState([])

  useEffect(() => {
    const handler = (payload) => {
      const items = []
      if (payload.xpGained) items.push({ type: 'xp', xpGained: payload.xpGained })
      ;(payload.newBadges || []).forEach(b => items.push({ type: 'badge', ...b }))
      if (!items.length) return

      const withIds = items.map((it, i) => ({ id: Date.now() + Math.random() + i, ...it }))
      setQueue(q => [...q, ...withIds])
      withIds.forEach(item => {
        setTimeout(() => setQueue(q => q.filter(x => x.id !== item.id)), 3000)
      })
    }
    listeners.push(handler)
    return () => { listeners = listeners.filter(l => l !== handler) }
  }, [])

  if (queue.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      <style>{CSS}</style>
      {queue.map(item =>
        item.type === 'xp' ? (
          <div key={item.id}
            className="xp-toast bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-orange-200 text-base flex items-center gap-1.5">
            ⚡ +{item.xpGained} XP
          </div>
        ) : (
          <div key={item.id}
            className="badge-toast bg-white border-2 border-amber-300 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 max-w-xs">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Huy hiệu mới!</p>
              <p className="text-gray-900 font-bold text-base leading-tight">{item.name}</p>
            </div>
          </div>
        )
      )}
    </div>
  )
}

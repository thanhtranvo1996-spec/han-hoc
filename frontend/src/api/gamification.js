import { API } from './config'
import { showXpToast } from '../components/XpToast'

// Gọi sau khi hoàn thành 1 hành động để cộng XP — tự hiện toast nếu thành công
export async function award(reason, meta = {}) {
  try {
    const r = await fetch(`${API}/gamification/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, meta }),
    })
    if (!r.ok) return null
    const data = await r.json()
    showXpToast({ xpGained: data.xpGained, newBadges: data.newBadges })
    return data
  } catch {
    return null
  }
}

export async function getSummary() {
  const r = await fetch(`${API}/gamification/summary`)
  if (!r.ok) throw new Error('Không tải được dữ liệu gamification')
  return r.json()
}

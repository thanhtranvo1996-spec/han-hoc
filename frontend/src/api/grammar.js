const BASE = 'http://localhost:3001/api'

export async function getGrammarByLevel(level) {
  const res = await fetch(`${BASE}/grammar/${level}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

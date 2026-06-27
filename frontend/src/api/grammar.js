import { API as BASE } from './config'

export async function getGrammarByLevel(level) {
  const res = await fetch(`${BASE}/grammar/${level}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

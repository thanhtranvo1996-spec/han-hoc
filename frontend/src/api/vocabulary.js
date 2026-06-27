import { API as BASE } from './config'

export async function getAllVocabulary({ limit = 100, offset = 0 } = {}) {
  const res = await fetch(`${BASE}/vocabulary?limit=${limit}&offset=${offset}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getVocabularyByLevel(level) {
  const res = await fetch(`${BASE}/vocabulary/${level}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function searchVocabulary(query) {
  const res = await fetch(`${BASE}/vocabulary/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function saveProgress(word_id, status) {
  const res = await fetch(`${BASE}/progress`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ word_id, status }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getProgress(level) {
  const res = await fetch(`${BASE}/progress/${level}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

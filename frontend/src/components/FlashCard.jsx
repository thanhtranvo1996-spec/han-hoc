import { useState, useRef } from 'react'
import { API } from '../api/config'

export default function FlashCard({ word, onKnow, onUnknow }) {
  const [flipped, setFlipped]   = useState(false)
  const [playing, setPlaying]   = useState(false)
  const audioRef = useRef(null)
  const cardRef  = useRef(null)

  const pinyin = (word.pinyin || '').replace(/^\/|\/$/g, '').trim()

  function handleFlip() {
    setFlipped(f => !f)
  }

  async function handleSpeak(e) {
    e.stopPropagation()
    if (playing) return
    // Dùng backend TTS (Google Translate) thay Web Speech API
    // → hoạt động đồng nhất trên Android, iOS, desktop
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    setPlaying(true)
    try {
      const audio = new Audio(
        `${API}/tts?text=${encodeURIComponent(word.chinese)}&speed=normal`
      )
      audioRef.current = audio
      audio.onended = () => setPlaying(false)
      audio.onerror = () => setPlaying(false)
      await audio.play()
    } catch {
      setPlaying(false)
    }
  }

  function handleKnow(e) {
    e.stopPropagation()
    setFlipped(false)
    onKnow?.(word)
  }

  function handleUnknow(e) {
    e.stopPropagation()
    setFlipped(false)
    onUnknow?.(word)
  }

  return (
    <div className="w-full max-w-sm mx-auto" style={{ perspective: '1000px' }}>
      {/* Card wrapper — giữ chiều cao cố định */}
      <div
        ref={cardRef}
        onClick={handleFlip}
        className="relative w-full cursor-pointer select-none"
        style={{
          height: '380px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >

        {/* ── MẶT TRƯỚC ─────────────────────────────────── */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-100
                     flex flex-col items-center justify-center gap-6 px-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* HSK badge */}
          <span className="absolute top-4 left-4 bg-[#C0392B]/10 text-[#C0392B] text-xs font-semibold px-2 py-0.5 rounded-full">
            HSK {word.hsk_level}
          </span>

          {/* "Bấm để lật" hint */}
          <span className="absolute top-4 right-4 text-gray-300 text-xs">
            Bấm để lật →
          </span>

          {/* Chữ Hán */}
          <p
            className="font-hanzi font-black text-gray-900 leading-none"
            style={{ fontSize: '72px' }}
          >
            {word.chinese}
          </p>

          {/* Nút phát âm */}
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-2 px-5 py-2 rounded-full border-2 font-medium text-sm transition-all
              ${playing
                ? 'border-[#C0392B] bg-[#C0392B] text-white scale-95'
                : 'border-[#C0392B]/40 text-[#C0392B] hover:bg-[#C0392B]/5 hover:border-[#C0392B]'
              }`}
          >
            <span className={playing ? 'animate-pulse' : ''}>🔊</span>
            Nghe phát âm
          </button>
        </div>

        {/* ── MẶT SAU ───────────────────────────────────── */}
        <div
          className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-100
                     flex flex-col items-center justify-center gap-3 px-8 pb-20"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* HSK badge */}
          <span className="absolute top-4 left-4 bg-[#C0392B]/10 text-[#C0392B] text-xs font-semibold px-2 py-0.5 rounded-full">
            HSK {word.hsk_level}
          </span>

          {/* Chữ Hán nhỏ */}
          <p className="font-hanzi text-3xl font-bold text-gray-400">
            {word.chinese}
          </p>

          {/* Pinyin */}
          <p className="text-[#C0392B] font-semibold text-xl tracking-wide">
            {pinyin}
          </p>

          {/* Nghĩa tiếng Việt */}
          <p className="text-gray-900 font-bold text-2xl text-center leading-snug">
            {word.vietnamese}
          </p>

          {/* Câu ví dụ */}
          {word.example && (
            <p className="font-hanzi text-gray-400 text-sm text-center leading-relaxed mt-1">
              {word.example}
            </p>
          )}

          {/* Nút hành động */}
          <div className="absolute bottom-5 left-0 right-0 flex gap-3 px-6">
            <button
              onClick={handleUnknow}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-red-50 text-[#C0392B] font-semibold border-2 border-red-100
                         hover:bg-[#C0392B] hover:text-white hover:border-[#C0392B] transition-all"
            >
              ❌ Chưa thuộc
            </button>
            <button
              onClick={handleKnow}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         bg-green-50 text-green-600 font-semibold border-2 border-green-100
                         hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
            >
              ✅ Thuộc rồi
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

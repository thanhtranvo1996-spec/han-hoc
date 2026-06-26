import { useState, useEffect, useCallback } from 'react'
import {
  DndContext, PointerSensor, useSensor, useSensors,
  DragOverlay, closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable,
  horizontalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { API } from '../api/config'

let _aud = null
function playTTS(text, speed = 'normal') {
  if (_aud) { _aud.pause(); _aud = null }
  _aud = new Audio(`${API}/tts?text=${encodeURIComponent(text)}&speed=${speed}`)
  _aud.play().catch(() => {})
}

// ─── Confetti ──────────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id:    i,
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    color: ['#C0392B','#27AE60','#2980B9','#F39C12','#8E44AD'][i % 5],
    size:  `${6 + Math.random() * 8}px`,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left, top: '-10px',
          width: p.size, height: p.size, background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animationDelay: p.delay, animation: 'confettiFall 1.8s ease-in forwards',
        }} />
      ))}
      <style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`}</style>
    </div>
  )
}

// ─── Chip có thể kéo (chỉ dùng trong dest để reorder) ──────────────────────────
function SortableChip({ id, label, status, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })
  const colors = {
    dest:    'bg-white border-gray-400 text-gray-800 hover:border-red-500 hover:bg-red-50',
    correct: 'bg-green-50 border-green-500 text-green-700',
    wrong:   'bg-red-50 border-red-400 text-red-700',
  }
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1, touchAction: 'none' }}
      className={`px-3 py-1.5 rounded-full text-sm font-hanzi font-medium cursor-pointer select-none border-2 transition-all ${colors[status ?? 'dest']}`}
    >
      {label}
    </div>
  )
}

// ─── Chip nguồn (chỉ click, không drag) ────────────────────────────────────────
function SourceChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-sm font-hanzi font-medium cursor-pointer select-none border-2 border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:border-blue-500 active:scale-95 transition-all"
    >
      {label}
    </button>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function SentenceBuilder({ item, speed = 'normal', onCorrect, onWrong, onNext }) {
  const { word, sentence, words_shuffled, words_in_order } = item

  const [source,  setSource]  = useState([])
  const [dest,    setDest]    = useState([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeId, setActiveId] = useState(null)

  const makeChips = useCallback(tokens =>
    tokens.map((t, i) => ({ id: `${i}-${t}`, label: t }))
  , [])

  useEffect(() => {
    setSource(makeChips(words_shuffled))
    setDest([])
    setChecked(false)
    setCorrect(false)
    setShowConfetti(false)
  }, [item])

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }))

  // ── Bấm chip nguồn → thêm vào cuối dest ──────────────────────────────────────
  const handleSourceClick = (chip) => {
    if (checked) return
    setSource(prev => prev.filter(c => c.id !== chip.id))
    setDest(prev => [...prev, chip])
  }

  // ── Bấm chip dest → trả về nguồn ─────────────────────────────────────────────
  const handleDestClick = (chip) => {
    if (checked) return
    setDest(prev => prev.filter(c => c.id !== chip.id))
    setSource(prev => [...prev, chip])
  }

  // ── Kéo trong dest để reorder ─────────────────────────────────────────────────
  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const destIds = dest.map(c => c.id)
    if (destIds.includes(active.id) && destIds.includes(over.id)) {
      setDest(prev => arrayMove(prev,
        prev.findIndex(c => c.id === active.id),
        prev.findIndex(c => c.id === over.id)
      ))
    }
  }

  // ── Kiểm tra ──────────────────────────────────────────────────────────────────
  const handleCheck = () => {
    if (checked || dest.length === 0) return
    const built = dest.map(c => c.label).join('')
    const isOk  = built === sentence
    setChecked(true)
    setCorrect(isOk)
    if (isOk) {
      setShowConfetti(true)
      playTTS(sentence, speed)
      onCorrect?.()
      setTimeout(() => setShowConfetti(false), 2000)
    } else {
      onWrong?.()
    }
  }

  const getDestStatus = (chip, idx) => {
    if (!checked) return 'dest'
    const order = words_in_order ?? []
    return order[idx] === chip.label ? 'correct' : 'wrong'
  }

  const activeChip = dest.find(c => c.id === activeId)
  const destIds    = dest.map(c => c.id)
  const allPlaced  = source.length === 0

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      {/* Thông tin từ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <span className="font-hanzi text-2xl text-gray-800">{word.chinese}</span>
          <span className="text-blue-500 text-sm ml-2">{word.pinyin}</span>
          <p className="text-gray-500 text-xs mt-0.5">{word.vietnamese}</p>
        </div>
        <button onClick={() => playTTS(sentence, speed)}
          className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-lg shrink-0">🔊</button>
      </div>

      {/* Khu vực đích — có sortable để reorder */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Câu của bạn</p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={destIds} strategy={horizontalListSortingStrategy}>
            <div className={`min-h-[56px] rounded-xl border-2 border-dashed p-3 flex flex-wrap gap-2 transition-colors ${
              checked && correct  ? 'border-green-400 bg-green-50' :
              checked && !correct ? 'border-red-300   bg-red-50'   :
              dest.length > 0     ? 'border-red-400   bg-white'    :
                                    'border-gray-300  bg-gray-50'
            }`}>
              {dest.length === 0 && !checked && (
                <span className="text-gray-400 text-sm self-center">Bấm vào từ bên dưới để thêm vào đây...</span>
              )}
              {dest.map((chip, idx) => (
                <SortableChip
                  key={chip.id} id={chip.id} label={chip.label}
                  status={checked ? getDestStatus(chip, idx) : undefined}
                  onClick={() => handleDestClick(chip)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeChip && (
              <div className="px-3 py-1.5 rounded-full text-sm font-hanzi font-medium border-2 border-red-400 bg-white text-gray-800 shadow-lg cursor-grabbing">
                {activeChip.label}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Khu vực nguồn — chỉ click */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Từ có sẵn {source.length > 0 && <span className="text-blue-400 normal-case font-normal">(bấm để thêm vào câu)</span>}
        </p>
        <div className="min-h-[48px] rounded-xl bg-blue-50 border border-blue-100 p-3 flex flex-wrap gap-2">
          {source.length === 0
            ? <span className="text-blue-300 text-sm self-center">Đã dùng hết — bấm vào câu để trả lại</span>
            : source.map(chip => (
                <SourceChip key={chip.id} label={chip.label} onClick={() => handleSourceClick(chip)} />
              ))
          }
        </div>
      </div>

      {/* Kết quả */}
      {checked && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {correct
            ? '🎉 Chính xác!'
            : <span>
                ❌ Câu đúng:{' '}
                <span className="font-hanzi text-base font-semibold">{sentence}</span>
                <button onClick={() => playTTS(sentence, speed)} className="ml-2 text-base">🔊</button>
              </span>
          }
        </div>
      )}

      {/* Nút hành động */}
      <div className="flex gap-3">
        {!checked && dest.length > 0 && (
          <button onClick={() => { setSource(makeChips(words_shuffled)); setDest([]) }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Xóa tất cả
          </button>
        )}
        {!checked && (
          <button onClick={handleCheck} disabled={dest.length === 0}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${
              allPlaced ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {allPlaced ? 'Kiểm tra' : `Còn ${source.length} từ chưa xếp`}
          </button>
        )}
        {checked && (
          <button onClick={onNext}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-800 hover:bg-gray-900 text-white transition-colors">
            Tiếp tục →
          </button>
        )}
      </div>
    </div>
  )
}

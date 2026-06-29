import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FlashcardPage from './pages/FlashcardPage'
import QuizPage from './pages/QuizPage'
import ListeningPage from './pages/ListeningPage'
import WritingPage from './pages/WritingPage'
import ChatPage from './pages/ChatPage'
import VocabListPage from './pages/VocabListPage'
import GrammarPage from './pages/GrammarPage'
import DashboardPage from './pages/DashboardPage'
import TypingPage from './pages/TypingPage'

// Nút floating: về trang chủ + cuộn lên
function FloatingNav() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 280)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname === '/') return null

  const btnBase = 'w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-all active:scale-95'

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-3">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Cuộn lên đầu trang"
          className={`${btnBase} bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`}
        >
          ↑
        </button>
      )}
      <button
        onClick={() => navigate('/')}
        title="Về trang chủ"
        className={`${btnBase} bg-[#C0392B] text-white hover:bg-[#96281B]`}
      >
        🏠
      </button>
    </div>
  )
}

function Layout() {
  return (
    <>
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/flashcard" element={<FlashcardPage />} />
        <Route path="/quiz"      element={<QuizPage />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/writing"   element={<WritingPage />} />
        <Route path="/chat"      element={<ChatPage />} />
        <Route path="/vocab"     element={<VocabListPage />} />
        <Route path="/grammar"   element={<GrammarPage />} />
        <Route path="/typing"    element={<TypingPage />} />
      </Routes>
      <FloatingNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

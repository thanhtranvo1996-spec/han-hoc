import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
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

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
    </BrowserRouter>
  )
}

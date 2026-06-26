import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',           label: 'Trang chủ' },
  { to: '/dashboard',  label: '📊 Dashboard' },
  { to: '/flashcard', label: 'Flashcard' },
  { to: '/quiz',      label: 'Quiz' },
  { to: '/listening', label: 'Luyện nghe' },
  { to: '/writing',   label: 'Đặt câu' },
  { to: '/chat',      label: 'Chat AI' },
  { to: '/vocab',     label: 'Từ vựng' },
  { to: '/grammar',   label: 'Ngữ pháp' },
]

export default function Navbar() {
  return (
    <nav className="bg-[#C0392B] shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 text-white no-underline">
          <span className="text-2xl">🏮</span>
          <span className="font-hanzi font-bold text-lg tracking-wide">漢學</span>
          <span className="font-bold text-sm hidden sm:inline opacity-90">Hán Học</span>
        </NavLink>

        {/* Links */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ` +
                (isActive
                  ? 'bg-white text-[#C0392B] font-semibold'
                  : 'text-white/90 hover:bg-white/20')
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

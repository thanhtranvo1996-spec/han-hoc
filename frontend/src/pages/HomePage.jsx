import { Link } from 'react-router-dom'

const TILES = [
  { to:'/dashboard', fa:'fa-chart-line',      label:'Dashboard',   sub:'Tiến độ học tập', bg:'#1565C0', cls:'tile-wide', delay:0.00 },
  { to:'/chat',      fa:'fa-robot',           label:'Chat AI',     sub:'Trợ lý AI',       bg:'#1b2631', cls:'',          delay:0.08 },
  { to:'/flashcard', fa:'fa-layer-group',     label:'Flashcard',   sub:'Ôn từ vựng',      bg:'#B71C1C', cls:'',          delay:0.12 },
  { to:'/quiz',      fa:'fa-circle-question', label:'Quiz',        sub:'Kiểm tra',        bg:'#6A1B9A', cls:'',          delay:0.16 },
  { to:'/listening', fa:'fa-headphones',      label:'Luyện nghe',  sub:'Nghe & hiểu',     bg:'#00695C', cls:'',          delay:0.20 },
  { to:'/writing',   fa:'fa-pen',             label:'Đặt câu',     sub:'Luyện viết',      bg:'#E65100', cls:'',          delay:0.14 },
  { to:'/vocab',     fa:'fa-book-open',       label:'Từ vựng',     sub:'Tổng hợp từ',     bg:'#2E7D32', cls:'',          delay:0.18 },
  { to:'/typing',    fa:'fa-keyboard',        label:'Luyện gõ',    sub:'Gõ chữ Hán',      bg:'#4527A0', cls:'',          delay:0.22 },
  { to:'/grammar',   fa:'fa-graduation-cap',  label:'Ngữ pháp',    sub:'HSK 1–6',         bg:'#006064', cls:'tile-full',  delay:0.26 },
]

const CSS = `
@keyframes tileIn {
  from { opacity:0; transform:scale(0.82) translateY(18px); }
  to   { opacity:1; transform:scale(1)    translateY(0); }
}
@keyframes shine {
  0%, 33%   { transform:translateX(-180%); }
  66%, 100% { transform:translateX(180%); }
}
.hp-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.tile-full { grid-column: span 2; }
@media (min-width: 640px) {
  .hp-grid   { grid-template-columns: repeat(3, 1fr); }
  .tile-wide { grid-column: span 2; }
  .tile-full { grid-column: span 3; }
}
.han-tile {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  height: 132px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 14px 16px;
  text-decoration: none;
  animation: tileIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
  transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease;
  box-shadow: 0 3px 10px rgba(0,0,0,0.3);
}
@media (min-width: 640px) { .han-tile { height: 150px; } }
.han-tile:hover {
  transform: translateY(-4px) scale(1.025);
  filter: brightness(1.12);
  box-shadow: 0 12px 28px rgba(0,0,0,0.45);
  z-index: 1;
}
.tile-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.09) 50%, transparent 62%);
  animation: shine 5s ease-in-out infinite;
  pointer-events: none;
}
.tile-bg-icon {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 72px;
  color: rgba(255,255,255,0.07);
  pointer-events: none;
  line-height: 1;
}
.tile-fa   { font-size:19px; color:rgba(255,255,255,0.93); margin-bottom:7px; display:block; }
.tile-name { color:#fff; font-size:14px; font-weight:700; line-height:1.2; letter-spacing:0.01em; }
.tile-sub  { color:rgba(255,255,255,0.5); font-size:10px; margin-top:3px; letter-spacing:0.02em; text-transform:uppercase; }
`

export default function HomePage() {
  return (
    <main style={{ background:'linear-gradient(150deg,#8B1A10 0%,#C0392B 55%,#D4591A 100%)', minHeight:'100vh' }} className="px-4 pb-10">
      <style>{CSS}</style>

      <div className="max-w-2xl mx-auto pt-8 pb-6">
        <div className="font-hanzi select-none leading-none"
             style={{ fontSize:72, color:'rgba(255,255,255,0.12)' }}>漢</div>
        <h1 className="font-hanzi font-black"
            style={{ fontSize:30, marginTop:-20, color:'#fff' }}>漢學 Hán Học</h1>
        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:6 }}>Chinh phục HSK từ con số 0</p>
      </div>

      <div className="hp-grid max-w-2xl mx-auto">
        {TILES.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            className={`han-tile ${t.cls}`}
            style={{ backgroundColor:t.bg, animationDelay:`${t.delay}s` }}
          >
            <div className="tile-shine" style={{ animationDelay:`${i * 0.6}s` }} />
            <i className={`fa-solid ${t.fa} tile-bg-icon`} aria-hidden="true" />
            <i className={`fa-solid ${t.fa} tile-fa`} aria-hidden="true" />
            <span className="tile-name">{t.label}</span>
            <span className="tile-sub">{t.sub}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}

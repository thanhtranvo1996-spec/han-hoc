import { Link } from 'react-router-dom'

const TILES = [
  { to:'/dashboard', fa:'fa-chart-line',      hz:'学', label:'Dashboard',  sub:'Tiến độ học',  bg:'linear-gradient(145deg,#1565C0,#1E88E5)', delay:0.00 },
  { to:'/flashcard', fa:'fa-layer-group',     hz:'记', label:'Flashcard',  sub:'Ôn từ vựng',  bg:'linear-gradient(145deg,#C62828,#E53935)', delay:0.06 },
  { to:'/quiz',      fa:'fa-circle-question', hz:'考', label:'Quiz',       sub:'Kiểm tra',    bg:'linear-gradient(145deg,#6A1B9A,#9C27B0)', delay:0.10 },
  { to:'/listening', fa:'fa-headphones',      hz:'听', label:'Luyện nghe', sub:'Nghe & hiểu', bg:'linear-gradient(145deg,#00695C,#009688)', delay:0.14 },
  { to:'/writing',   fa:'fa-pen',             hz:'写', label:'Đặt câu',    sub:'Luyện viết',  bg:'linear-gradient(145deg,#BF360C,#F4511E)', delay:0.08 },
  { to:'/chat',      fa:'fa-robot',           hz:'问', label:'Chat AI',    sub:'Trợ lý AI',   bg:'linear-gradient(145deg,#283593,#3949AB)', delay:0.18 },
  { to:'/vocab',     fa:'fa-book-open',       hz:'词', label:'Từ vựng',    sub:'Tổng hợp từ', bg:'linear-gradient(145deg,#2E7D32,#43A047)', delay:0.12 },
  { to:'/typing',    fa:'fa-keyboard',        hz:'打', label:'Luyện gõ',   sub:'Gõ Hán tự',   bg:'linear-gradient(145deg,#4527A0,#7E57C2)', delay:0.16 },
  { to:'/grammar',   fa:'fa-graduation-cap',  hz:'法', label:'Ngữ pháp',   sub:'HSK 1–6',     bg:'linear-gradient(145deg,#004D40,#00897B)', delay:0.20 },
  { to:'/topic',     fa:'fa-wand-magic-sparkles', hz:'业', label:'Chủ đề AI', sub:'Từ vựng nghề', bg:'linear-gradient(145deg,#E65100,#FF6F00)', delay:0.22, badge:'MỚI' },
]

const CSS = `
@keyframes tileIn {
  from { opacity:0; transform:translateY(22px) scale(0.88); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes shine {
  0%,33%    { transform:translateX(-160%); }
  66%,100%  { transform:translateX(160%); }
}

/* Layout chiếm đúng 100vh */
.hp-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.hp-header {
  flex-shrink: 0;
  text-align: center;
  padding: 18px 20px 10px;
}

.hp-grid-wrap {
  flex: 1;
  min-height: 0;       /* cho phép flex child co lại đúng cách */
  display: flex;
  flex-direction: column;
  padding: 0 12px 12px;
}

.hp-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 10px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

/* Mobile: 2 cột, tile cao cố định, cuộn dọc */
@media (max-width: 599px) {
  .hp-root      { height: auto; min-height: 100vh; overflow: visible; }
  .hp-grid-wrap { flex: none; padding-bottom: 24px; }
  .hp-grid      { grid-template-columns: repeat(2,1fr); grid-template-rows: none; }
  .han-tile     { height: 148px !important; }
}

.han-tile {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 20px 24px;
  text-decoration: none;
  animation: tileIn 0.42s cubic-bezier(0.25,0.46,0.45,0.94) both;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.2);
}
.han-tile:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}
.tile-shine {
  position: absolute; inset: 0;
  background: linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%);
  animation: shine 6s ease-in-out infinite;
  pointer-events: none;
}
.tile-hz {
  position: absolute; bottom: -14px; right: 10px;
  font-size: 120px; color: rgba(255,255,255,0.08);
  pointer-events: none; line-height: 1; font-weight: 900; user-select: none;
}
.tile-fa {
  font-size: 28px; color: rgba(255,255,255,0.95);
  margin-bottom: 12px; display: block;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
}
.tile-name {
  color: #fff; font-size: 16px; font-weight: 700;
  line-height: 1.2; text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.tile-sub {
  color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 4px;
}
.tile-badge {
  position: absolute; top: 10px; right: 10px;
  background: #FFF; color: #E65100;
  font-size: 9px; font-weight: 900; letter-spacing: 0.06em;
  padding: 2px 7px; border-radius: 20px;
}
`

export default function HomePage() {
  return (
    <main
      className="hp-root"
      style={{ background: 'linear-gradient(150deg,#8B1A10 0%,#C0392B 55%,#D4591A 100%)' }}
    >
      <style>{CSS}</style>

      {/* Header gọn */}
      <div className="hp-header">
        <div className="font-hanzi select-none"
             style={{ fontSize: 64, color: 'rgba(255,255,255,0.07)', lineHeight: 1, marginBottom: -18 }}>
          漢
        </div>
        <h1 className="font-hanzi font-black"
            style={{ fontSize: 28, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.25)', letterSpacing: '0.02em' }}>
          漢學 Hán Học
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, marginTop: 5, letterSpacing: '0.06em' }}>
          CHINH PHỤC HSK TỪ CON SỐ 0
        </p>
      </div>

      {/* Grid lấp đầy phần còn lại */}
      <div className="hp-grid-wrap">
        <div className="hp-grid">
          {TILES.map((t, i) => (
            <Link
              key={t.to}
              to={t.to}
              className="han-tile"
              style={{ background: t.bg, animationDelay: `${t.delay}s` }}
            >
              <div className="tile-shine" style={{ animationDelay: `${i * 0.65}s` }} />
              <span className="tile-hz font-hanzi" aria-hidden="true">{t.hz}</span>
              {t.badge && <span className="tile-badge">{t.badge}</span>}
              <i className={`fa-solid ${t.fa} tile-fa`} aria-hidden="true" />
              <span className="tile-name">{t.label}</span>
              <span className="tile-sub">{t.sub}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

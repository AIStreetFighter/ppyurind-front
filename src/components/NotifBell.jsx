import { useState } from 'react'

const NOTIFS = [
  { icon: 'fa-solid fa-heart', color: 'var(--like)', title: '공감 3', body: '"기념일을 매번 제가 챙겨요" 글에 공감이 달렸어요.', time: '방금' },
  { icon: 'fa-solid fa-comment', color: 'var(--brand)', title: '새 댓글', body: '익명1: 저도 똑같아요. 먼저 챙기는 사람만 서운하죠…', time: '12분 전' },
  { icon: 'fa-solid fa-cake-candles', color: '#E0A24A', title: '기념일 알림', body: '🎂 첫째 생일이 일주일 남았어요. 선물 추천을 받아볼까요?', time: '오늘' },
  { icon: 'fa-solid fa-ring', color: 'var(--brand)', title: '기념일 알림', body: '💍 결혼기념일이 다가와요. AI가 문구를 준비했어요.', time: '어제' },
]

export default function NotifBell() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <i className="fa-regular fa-bell" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setOpen(true)}>
        <span className="notif-dot" />
      </i>
      {open && (
        <div className="sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 19, color: 'var(--ink)' }}>알림</h2>
              <span style={{ fontSize: 12.5, color: 'var(--brand-soft-text)', cursor: 'pointer' }} onClick={() => setOpen(false)}>모두 읽음</span>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              {NOTIFS.map((n, i) => (
                <div key={i} className="notif-item">
                  <div className="notif-ic" style={{ background: `color-mix(in srgb, ${n.color} 18%, transparent)`, color: n.color }}>
                    <i className={n.icon}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="notif-title">{n.title} <span className="notif-time">· {n.time}</span></p>
                    <p className="notif-body">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

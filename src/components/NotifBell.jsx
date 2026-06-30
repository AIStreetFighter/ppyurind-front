import { useState } from 'react'

const NOTIFICATIONS = [
  {
    icon: 'fa-solid fa-heart',
    color: 'var(--like)',
    title: '공감 3',
    body: '"기념일을 매번 제가 챙겨요" 글에 공감이 달렸어요.',
    time: '방금',
  },
  {
    icon: 'fa-solid fa-comment',
    color: 'var(--brand)',
    title: '새 댓글',
    body: '익명1: 저도 똑같아요. 먼저 챙기는 사람만 서운하죠...',
    time: '12분 전',
  },
  {
    icon: 'fa-solid fa-cake-candles',
    color: '#E0A24A',
    title: '기념일 알림',
    body: '첫째 생일이 일주일 남았어요. 선물 추천을 받아볼까요?',
    time: '오늘',
  },
  {
    icon: 'fa-solid fa-ring',
    color: 'var(--brand)',
    title: '기념일 알림',
    body: '결혼기념일이 다가와요. AI가 문구를 준비했어요.',
    time: '어제',
  },
]

export default function NotifBell() {
  const [open, setOpen] = useState(false)
  const hasNotifications = NOTIFICATIONS.length > 0

  return (
    <>
      <button
        type="button"
        className="notif-trigger"
        aria-label="알림 열기"
        onClick={() => setOpen(true)}
      >
        <i className="fa-regular fa-bell"></i>
        {hasNotifications && <span className="notif-dot" />}
      </button>

      {open && (
        <div className="notif-drawer-backdrop" onClick={() => setOpen(false)}>
          <aside className="notif-drawer" onClick={e => e.stopPropagation()} aria-label="알림">
            <header className="notif-drawer__top">
              <button type="button" className="notif-back" onClick={() => setOpen(false)} aria-label="뒤로가기">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2>알림</h2>
              <span className="notif-top-spacer" />
            </header>

            <section className="notif-push-card">
              <span className="notif-push-card__icon"><i className="fa-solid fa-bell"></i></span>
              <p>기기 알림 키고 소식을 받아보세요</p>
              <button type="button">알림켜기</button>
            </section>

            {hasNotifications ? (
              <div className="notif-list">
                {NOTIFICATIONS.map((n, i) => (
                  <article key={i} className="notif-item">
                    <div className="notif-ic" style={{ background: `color-mix(in srgb, ${n.color} 18%, transparent)`, color: n.color }}>
                      <i className={n.icon}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="notif-title">{n.title} <span className="notif-time">· {n.time}</span></p>
                      <p className="notif-body">{n.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="notif-empty">
                <div className="notif-empty__mascot">
                  <i className="fa-regular fa-bell"></i>
                </div>
                <h3>도착한 알림이 없어요</h3>
                <p>곧 좋은 소식 알려드릴게요.</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  )
}

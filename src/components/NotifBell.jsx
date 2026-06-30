import { useState } from 'react'

const NOTIFICATIONS = []

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

import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import BottomNav from '../components/BottomNav'
import { EVENT_TYPES, ymd } from '../data/events'
import { listEvents, createEvent, deleteEvent } from '../api/ppyurindApi'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar({ nav, isDark, toggleTheme }) {
  const [view, setView] = useState(new Date())
  const [selected, setSelected] = useState(ymd(new Date()))
  const [adding, setAdding] = useState(false)
  const [events, setEvents] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newType, setNewType] = useState('anniv')

  useEffect(() => {
    listEvents().then(data => {
      const arr = Array.isArray(data) ? data : (data.items || [])
      setEvents(arr.map(e => ({ ...e, date: e.date || e.event_date, type: e.type || e.event_type })))
    }).catch(() => {})
  }, [])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysIn = new Date(year, month + 1, 0).getDate()
  const todayStr = ymd(new Date())

  const eventsOf = (dateStr) => events.filter(e => e.date === dateStr)
  const monthEvents = events
    .filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .sort((a, b) => a.date.localeCompare(b.date))

  const openAdd = () => { setNewTitle(''); setNewDate(selected || todayStr); setNewType('anniv'); setAdding(true) }

  const submitEvent = async () => {
    if (!newTitle.trim() || !newDate) return
    try {
      const created = await createEvent({ eventType: newType, eventDate: newDate, title: newTitle.trim() })
      setEvents(prev => [...prev, { ...created, date: created.date || newDate, type: created.type || newType }])
    } catch {
      setEvents(prev => [...prev, { date: newDate, type: newType, title: newTitle.trim() }])
    }
    setView(new Date(Number(newDate.slice(0, 4)), Number(newDate.slice(5, 7)) - 1, 1))
    setSelected(newDate)
    setAdding(false)
  }

  const removeEvent = async (e) => {
    if (e.id) await deleteEvent(e.id).catch(() => {})
    setEvents(prev => prev.filter(ev => ev !== e))
  }

  const shift = (delta) => { setView(new Date(year, month + delta, 1)); setSelected('') }

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysIn; d++) cells.push(d)

  const selectedEvents = eventsOf(selected)

  return (
    <div className="phone-body">
      <div className="topbar">
        <div className="backbar-inline">
          <i className="fa-solid fa-arrow-left" onClick={() => nav('home')}></i>
          <p className="eyebrow" style={{ margin: 0 }}>캘린더</p>
        </div>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>

      {/* 월 네비게이션 */}
      <div className="cal-nav">
        <i className="fa-solid fa-chevron-left" onClick={() => shift(-1)}></i>
        <span>{year}년 {month + 1}월</span>
        <i className="fa-solid fa-chevron-right" onClick={() => shift(1)}></i>
      </div>

      {/* 달력 그리드 */}
      <div className="card" style={{ padding: 14 }}>
        <div className="cal-grid cal-week">
          {WEEK.map((w, i) => <div key={w} className={`cal-wd${i === 0 ? ' sun' : ''}`}>{w}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((d, i) => {
            if (d == null) return <div key={`e${i}`} />
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const evs = eventsOf(dateStr)
            const isSel = dateStr === selected
            const isToday = dateStr === todayStr
            return (
              <div key={d} className={`cal-day${isSel ? ' sel' : ''}${isToday ? ' today' : ''}`} onClick={() => setSelected(dateStr)}>
                <span>{d}</span>
                <div className="cal-dots">
                  {evs.slice(0, 3).map((e, j) => <i key={j} style={{ background: EVENT_TYPES[e.type].color }} />)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 선택일 / 이번 달 일정 */}
      <div className="section-label" style={{ justifyContent: 'space-between' }}>
        <span><i className="fa-regular fa-calendar-check" style={{ marginRight: 7 }}></i>
          {selectedEvents.length ? `${month + 1}월 ${Number(selected.slice(-2))}일 일정` : `${month + 1}월 일정`}
        </span>
      </div>
      <div className="stack">
        {(selectedEvents.length ? selectedEvents : monthEvents).map((e, i) => {
          const t = EVENT_TYPES[e.type] || EVENT_TYPES.anniv
          const dday = Math.round((new Date(e.date) - new Date(todayStr)) / 86400000)
          return (
            <div key={i} className="card event-row" onClick={() => setSelected(e.date)}>
              <div className="event-emoji" style={{ background: `color-mix(in srgb, ${t.color} 18%, transparent)` }}>{t.emoji}</div>
              <div style={{ flex: 1 }}>
                <p className="row__title" style={{ marginBottom: 2 }}>{e.title}</p>
                <p className="row__sub">{e.date.slice(5).replace('-', '월 ')}일 · {t.label}</p>
              </div>
              {dday >= 0 && <span className="badge badge--match">D-{dday}</span>}
              <i className="fa-solid fa-trash" style={{ color: 'var(--ink-muted)', fontSize: 13, marginLeft: 8, cursor: 'pointer' }}
                onClick={ev => { ev.stopPropagation(); removeEvent(e) }} />
            </div>
          )
        })}
        {!selectedEvents.length && !monthEvents.length && (
          <p style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: 13.5, padding: '20px 0' }}>이 달엔 등록된 일정이 없어요.</p>
        )}
      </div>

      <button className="cta" style={{ marginTop: 18 }} onClick={openAdd}>
        <i className="fa-solid fa-plus" style={{ marginRight: 7 }}></i>일정 · 기념일 추가
      </button>

      {adding && (
        <div className="sheet-backdrop" onClick={() => setAdding(false)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--ink)' }}>일정 추가</h3>
            <input className="field" style={{ width: '100%', marginBottom: 10 }} placeholder="일정 이름 (예: 결혼기념일)"
              value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus />
            <input className="field" type="date" style={{ width: '100%', marginBottom: 10 }}
              value={newDate} onChange={e => setNewDate(e.target.value)} />
            <div className="chip-row" style={{ marginBottom: 16 }}>
              {Object.entries(EVENT_TYPES).map(([k, t]) => (
                <span key={k} className={`chip chip--sm${newType === k ? ' selected' : ''}`} onClick={() => setNewType(k)}>{t.emoji} {t.label}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setAdding(false)}>취소</button>
              <button className="cta" style={{ flex: 1, opacity: newTitle.trim() && newDate ? 1 : 0.5 }} onClick={submitEvent}>추가하기</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="홈" nav={nav} />
    </div>
  )
}

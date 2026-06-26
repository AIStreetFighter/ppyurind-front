// 캘린더 · 홈에서 공유하는 기념일/일정 데이터 (시연용 더미)
export const EVENT_TYPES = {
  anniv:    { label: '기념일', color: 'var(--brand)',     emoji: '💍' },
  birthday: { label: '생일',   color: '#E0A24A',          emoji: '🎂' },
  fight:    { label: '다툰 날', color: 'var(--like)',      emoji: '⛈️' },
  talk:     { label: '대화한 날', color: '#3FB984',        emoji: '💬' },
  date:     { label: '데이트', color: '#5B8DEF',          emoji: '💗' },
}

export const EVENTS = [
  { date: '2026-06-02', type: 'anniv',    title: '결혼기념일' },
  { date: '2026-06-10', type: 'fight',    title: '저녁에 다툰 날' },
  { date: '2026-06-18', type: 'birthday', title: '첫째 생일' },
  { date: '2026-06-25', type: 'talk',     title: '오래 대화한 날' },
  { date: '2026-06-28', type: 'date',     title: '한강 데이트' },
  { date: '2026-07-07', type: 'date',     title: '처음 만난 날' },
  { date: '2026-07-15', type: 'anniv',    title: '내 생일' },
]

export const ymd = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 오늘 이후로 가장 가까운 기념일까지 D-day
export function nextAnniversary(today = new Date()) {
  const future = EVENTS
    .filter(e => e.type === 'anniv' || e.type === 'birthday')
    .map(e => ({ ...e, d: new Date(e.date) }))
    .filter(e => e.d >= new Date(today.toDateString()))
    .sort((a, b) => a.d - b.d)
  if (!future.length) return null
  const e = future[0]
  const diff = Math.round((e.d - new Date(today.toDateString())) / 86400000)
  return { ...e, dday: diff }
}

import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'
import { EVENTS, EVENT_TYPES } from '../data/events'
import NotifBell from '../components/NotifBell'

// 다가오는 기념일/생일에 맞춘 선물 추천 광고 — 진입 시 랜덤 노출
const GIFT_ADS = [
  { for: 'anniv',    emoji: '💍', title: '결혼기념일 선물, 커플 각인 반지 특가', sub: '기념일 추천 · 제휴' },
  { for: 'anniv',    emoji: '🌷', title: '기념일엔 프리저브드 플라워 한 송이', sub: '기념일 추천 · 제휴' },
  { for: 'anniv',    emoji: '🏨', title: '둘만의 기념일, 호캉스 1박 할인', sub: '기념일 추천 · 제휴' },
  { for: 'anniv',    emoji: '🍽️', title: '기념일 디너, 분위기 좋은 레스토랑 예약', sub: '기념일 추천 · 제휴' },
  { for: 'birthday', emoji: '🎂', title: '생일 선물, 이름 새긴 케이크 주문', sub: '생일 추천 · 제휴' },
  { for: 'birthday', emoji: '🎁', title: '생일엔 향수, 우디 계열 베스트', sub: '생일 추천 · 제휴' },
  { for: 'birthday', emoji: '💐', title: '생일 축하 꽃다발 당일 배송', sub: '생일 추천 · 제휴' },
  { for: 'birthday', emoji: '🧁', title: '생일 디저트 박스, 둘이 나눠 먹기 좋은', sub: '생일 추천 · 제휴' },
]

const bars = [
  { day: '월', h: 42, color: 'var(--like)' },
  { day: '화', h: 58, color: 'color-mix(in srgb,var(--brand),var(--like) 40%)' },
  { day: '수', h: 34, color: 'var(--like)' },
  { day: '목', h: 66, color: 'var(--brand)' },
  { day: '금', h: 52, color: 'color-mix(in srgb,var(--brand),var(--like) 40%)' },
  { day: '토', h: 82, color: 'var(--brand)' },
  { day: '일', h: 74, color: 'var(--brand)' },
]

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function todayLabel() {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`
}

export default function Home({ nav, isDark, toggleTheme, nickname }) {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  // 홈 '이번 달 일정'에는 기념일·생일만 노출 (다툰 날 등은 캘린더에서만 확인)
  const monthEvents = EVENTS
    .filter(e => e.date.startsWith(ym) && (e.type === 'anniv' || e.type === 'birthday'))
    .sort((a, b) => a.date.localeCompare(b.date))

  // 이번 달 일정 타입에 맞는 선물 광고를 진입 시 랜덤 노출 (X로 닫기)
  const [adClosed, setAdClosed] = useState(false)
  const [gift] = useState(() => {
    const types = new Set(monthEvents.map(e => e.type))
    const pool = GIFT_ADS.filter(a => types.has(a.for))
    const list = pool.length ? pool : GIFT_ADS
    return list[Math.floor(Math.random() * list.length)]
  })

  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <p className="eyebrow">쀼라인드</p>
          <div className="topbar__icons">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <NotifBell />
          </div>
        </div>

        <div className="header">
          <h1 className="page-title">오늘 마음은<br />어때요, {nickname || '지우'}님?</h1>
          <p className="page-sub">{todayLabel()}</p>
          <div className="header-art">
            <img src="/assets/cats/cat_01_t.png" alt="" />
          </div>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-pen-to-square"></i>지금 감정 기록하기
        </div>
        <div className="card" style={{ padding: 18, cursor: 'pointer' }} onClick={() => nav('record')}>
          <div className="field" style={{ border: 'none', background: 'transparent', padding: '0 0 14px', color: 'var(--ink-muted)' }}>
            오늘 어떤 일이 있었나요? 속마음을 편하게 적어보세요.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-pill btn-ghost" style={{ flex: 1 }}><i className="fa-solid fa-keyboard"></i> 텍스트</button>
            <button className="btn-pill btn-ghost" style={{ flex: 1 }}><i className="fa-solid fa-microphone"></i> 음성</button>
            <button className="btn-pill btn-ghost" style={{ flex: 1 }}><i className="fa-solid fa-image"></i> 캡처</button>
          </div>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-comment-medical"></i>대화 어시스턴트
        </div>
        <div className="card assist-card" onClick={() => nav('translate')}>
          <div className="assist-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
          <div style={{ flex: 1 }}>
            <p className="row__title" style={{ marginBottom: 3 }}>이 마음, 말투 바꿔 전하기</p>
            <p className="row__sub">서운한 말도 부드럽게 · 비난을 요청으로 바꿔드려요</p>
          </div>
          <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-wave-square"></i>이번 주 감정 흐름
        </div>
        <div className="card">
          <div className="bars">
            {bars.map(b => (
              <div key={b.day} className="bar-col">
                <div className="bar" style={{ height: `${b.h}%`, background: b.color }}></div>
                <span className="bar-day">{b.day}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
            최근 기록에서 <b style={{ color: 'var(--ink)' }}>'서운함'</b>보다 <b style={{ color: 'var(--ink)' }}>'기대감'</b>이 자주 나타났어요 🌱
          </p>
        </div>

        <div className="section-label">
          <i className="fa-solid fa-heart-pulse"></i>관계 건강 지수
        </div>
        <div className="card health-card" onClick={() => nav('analysis')}>
          <div className="health-ring health-ring--caution">
            <span>주의</span>
          </div>
          <div style={{ flex: 1 }}>
            <p className="row__title" style={{ marginBottom: 3 }}>이번 주 관계 신호는 '주의'예요</p>
            <p className="row__sub">자책·서운함 표현이 늘었어요 · 분석 리포트 보기</p>
          </div>
          <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
        </div>

        <div className="section-label" style={{ justifyContent: 'space-between' }}>
          <span><i className="fa-regular fa-calendar-heart" style={{ marginRight: 7 }}></i>이번 달 일정</span>
          <span className="muted" style={{ cursor: 'pointer' }} onClick={() => nav('calendar')}>캘린더 열기 ›</span>
        </div>
        <div className="stack">
          {monthEvents.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: 13.5 }}>이번 달 일정이 없어요</div>
          )}
          {monthEvents.slice(0, 3).map((e, i) => {
            const t = EVENT_TYPES[e.type]
            const dday = Math.round((new Date(e.date) - new Date(new Date().toDateString())) / 86400000)
            return (
              <div key={i} className="card event-row" onClick={() => nav('calendar')}>
                <div className="event-emoji" style={{ background: `color-mix(in srgb, ${t.color} 18%, transparent)` }}>{t.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p className="row__title" style={{ marginBottom: 2 }}>{e.title}</p>
                  <p className="row__sub">{e.date.slice(5).replace('-', '월 ')}일 · {t.label}</p>
                </div>
                {(e.type === 'anniv' || e.type === 'birthday') && dday >= 0 && <span className="badge badge--match">D-{dday}</span>}
              </div>
            )
          })}
          {monthEvents.length > 0 && !adClosed && (
            <div className="card event-row home-gift-ad">
              <div className="event-emoji" style={{ background: 'color-mix(in srgb, var(--like) 16%, transparent)' }}>{gift.emoji}</div>
              <div style={{ flex: 1 }}>
                <p className="row__title" style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="ad-tag">AD</span>{gift.title}
                </p>
                <p className="row__sub">{gift.sub}</p>
              </div>
              <i
                className="fa-solid fa-xmark"
                style={{ color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer', padding: 4 }}
                onClick={(ev) => { ev.stopPropagation(); setAdClosed(true) }}
              ></i>
            </div>
          )}
        </div>
      </div>

      <BottomNav active="홈" nav={nav} />
    </>
  )
}

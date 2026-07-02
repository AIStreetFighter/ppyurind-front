import { useState, useRef, useEffect } from 'react'
import { CAT_CHAT } from '../data/images'
import SafetyCard from '../components/SafetyCard'
import { sendChatMessage } from '../api/ppyurindApi'

// 데모용 룰베이스 응답 — 키워드로 위험신호 감지 시 안전 지원, 그 외엔 공감형 응답
const DANGER_WORDS = ['폭력', '폭언', '때리', '맞았', '위협', '무서', '죽고', '자해', '협박', '학대']

function nowTime() {
  const d = new Date()
  const h = d.getHours()
  const ampm = h < 12 ? '오전' : '오후'
  const hh = h % 12 || 12
  return `${ampm} ${hh}:${String(d.getMinutes()).padStart(2, '0')}`
}

function buildReply(text) {
  const isDanger = DANGER_WORDS.some(w => text.includes(w))
  if (isDanger) {
    return {
      danger: true,
      lines: [
        '정말 많이 두렵고 힘드셨겠어요. 💜\n당신의 안전이 가장 중요해요.',
        '지금 안전한가요?\n위험한 상황이라면 안전한 장소로 먼저 이동해 주세요.',
      ],
    }
  }
  return {
    danger: false,
    lines: [
      '많이 속상하셨겠어요… 💜\n감정이 격해진 상황에서는 누구나 상처받기 쉬워요.',
      '지금은 잠시 숨을 고르고, 나의 감정과 바라는 마음을 정리한 뒤\n차분히 이야기 나눠보는 건 어떨까요?',
    ],
  }
}

const SUGGESTIONS = [
  '요즘 자꾸 다투게 돼요',
  '서운한 마음을 어떻게 전할까요?',
  '대화가 잘 안 통해요',
]

export default function Chat({ nav }) {
  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: '안녕하세요, 쀼냥이에요. 🐾\n마음에 담아둔 고민을 편하게 들려주세요. 함께 이야기 나눠요.',
      time: nowTime(),
    },
  ])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = async (raw) => {
    const text = (raw ?? draft).trim()
    if (!text || typing) return
    const history = messages
      .filter(m => !m.safety)
      .map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
    setMessages(m => [...m, { from: 'me', text, time: nowTime() }])
    setDraft('')
    setTyping(true)

    try {
      const data = await sendChatMessage({ message: text, history })
      // 백엔드 ChatResponse.reply 는 문자열 배열(list[str]) — 각 줄을 개별 말풍선으로 표시
      const rawReply = data?.reply ?? data?.message ?? ''
      const lines = (Array.isArray(rawReply) ? rawReply : [rawReply]).filter(Boolean)
      const showSafety = data?.show_safety_card || data?.risk_level === 'high'
      lines.forEach((line, i) => {
        setTimeout(() => {
          setMessages(m => [...m, { from: 'ai', text: line, time: nowTime() }])
          if (i === lines.length - 1 && showSafety) {
            setTimeout(() => setMessages(m => [...m, { from: 'ai', safety: true }]), 500)
          }
        }, 350 * i)
      })
    } catch {
      // 백엔드 오류 시 룰베이스 폴백
      const reply = buildReply(text)
      reply.lines.forEach((line, i) => {
        setTimeout(() => {
          setMessages(m => [...m, { from: 'ai', text: line, time: nowTime() }])
          if (i === reply.lines.length - 1 && reply.danger) {
            setTimeout(() => setMessages(m => [...m, { from: 'ai', safety: true }]), 500)
          }
        }, 600 * (i + 1))
      })
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      <div className="chat-topbar">
        <i className="fa-solid fa-chevron-left chat-back" onClick={() => nav('home')}></i>
        <p className="chat-title">쀼냥 상담 <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 13, color: 'var(--brand)' }}></i></p>
        <i className="fa-regular fa-user chat-prof"></i>
      </div>

      <div className="chat-body" ref={scrollRef}>
        {messages.map((m, i) => {
          if (m.safety) {
            return <div key={i} className="chat-safety"><SafetyCard nav={nav} signal="관계 위협 안전" /></div>
          }
          if (m.from === 'ai') {
            return (
              <div key={i} className="msg-row msg-row--ai">
                <div className="msg-avatar"><img src={CAT_CHAT} alt="" /></div>
                <div className="msg-stack">
                  <div className="msg-bubble msg-bubble--ai">{m.text}</div>
                  <span className="msg-time">{m.time}</span>
                </div>
              </div>
            )
          }
          return (
            <div key={i} className="msg-row msg-row--me">
              <div className="msg-stack msg-stack--me">
                <div className="msg-bubble msg-bubble--me">{m.text}</div>
                <span className="msg-time">{m.time}</span>
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="msg-row msg-row--ai">
            <div className="msg-avatar"><img src={CAT_CHAT} alt="" /></div>
            <div className="msg-bubble msg-bubble--ai msg-typing"><span></span><span></span><span></span></div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="chat-suggest">
            {SUGGESTIONS.map(s => (
              <button key={s} className="chat-suggest__chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="chat-input-bar">
        <input
          className="chat-input"
          placeholder="마음을 편하게 적어보세요…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button className="chat-send" onClick={() => send()} aria-label="보내기" disabled={!draft.trim() || typing}>
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </div>
    </>
  )
}

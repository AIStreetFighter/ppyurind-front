import { useState, useRef, useEffect } from 'react'
import { CAT_CHAT } from '../data/images'
import SafetyCard from '../components/SafetyCard'
import { sendChatMessage } from '../api/ppyurindApi'

function nowTime() {
  const d = new Date()
  const h = d.getHours()
  const ampm = h < 12 ? '오전' : '오후'
  const hh = h % 12 || 12
  return `${ampm} ${hh}:${String(d.getMinutes()).padStart(2, '0')}`
}

const SUGGESTIONS = [
  '마음이 너무 힘든데 상담 도움을 받을 수 있을까요?',
  '서운한 마음을 싸우지 않고 전하고 싶어요',
  '별거나 이혼을 고민할 때 법적으로 확인해야 할 게 있을까요?',
]

export default function Chat({ nav }) {
  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: '안녕하세요, 쀼냥이에요. 🐾\n마음에 담아둔 고민을 편하게 들려주세요. 함께 이야기 나눠요.',
      time: nowTime(),
      includeInHistory: false,
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
      .filter(m => !m.safety && m.text && m.includeInHistory !== false)
      .map(m => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
    setMessages(m => [...m, { from: 'me', text, time: nowTime() }])
    setDraft('')
    setTyping(true)

    try {
      const data = await sendChatMessage({ message: text, history })
      // 백엔드 ChatResponse.reply 는 문자열 배열(list[str]) — 각 줄을 개별 말풍선으로 표시
      const rawReply = data?.reply
      const lines = (Array.isArray(rawReply) ? rawReply : [rawReply])
        .filter(line => typeof line === 'string' && line.trim())
        .map(line => line.trim())
      if (lines.length === 0) throw new Error('Chat API response did not contain a valid reply')
      const showSafety = data?.show_safety_card || data?.risk_level === 'high'
      const replyMessages = lines.map(line => ({ from: 'ai', text: line, time: nowTime() }))
      if (showSafety) replyMessages.push({ from: 'ai', safety: true })
      setMessages(m => [...m, ...replyMessages])
    } catch (error) {
      console.error('Chat API request failed:', error)
      setMessages(m => [...m, {
        from: 'ai',
        text: '답변을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        time: nowTime(),
        includeInHistory: false,
      }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-topbar">
        <i className="fa-solid fa-chevron-left chat-back" onClick={() => nav('home')}></i>
        <p className="chat-title">쀼냥 상담 <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 13, color: 'var(--brand)' }}></i></p>
        {/* TODO: 추후 상담 프로필/마이페이지 연결 시 복구 */}
        {/* <i className="fa-regular fa-user chat-prof"></i> */}
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
    </div>
  )
}

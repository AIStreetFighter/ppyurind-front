import { useState, useEffect } from 'react'

const CHAT_DARK = '/assets/cats/chat_dark.png'
const CHAT_LIGHT = '/assets/cats/chat_light.png'

// 전역 플로팅 AI 상담 버튼 — 테두리 없이 고양이 일러스트만 은은하게 떠 있음.
// 진입 시 인사 말풍선을 잠깐 보여주고 자동으로 접어 화면을 어지럽히지 않음.
export default function FloatingChat({ nav, isDark, noBubble = false }) {
  const [showBubble, setShowBubble] = useState(!noBubble)

  useEffect(() => {
    setShowBubble(!noBubble)
  }, [noBubble])

  return (
    <div
      className="chatbot-fab"
      role="button"
      aria-label="쀼냥 AI 상담 열기"
      onClick={() => nav('chat')}
    >
      {showBubble && (
        <div className="chatbot-fab__bubble">쀼냥이랑 얘기해요 🐾</div>
      )}
      <img className="chatbot-fab__img" src={isDark ? CHAT_DARK : CHAT_LIGHT} alt="" />
    </div>
  )
}

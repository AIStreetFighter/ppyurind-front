import { CAT_CHAT } from '../data/images'

// 전역 플로팅 AI 상담 버튼 — 테두리 없이 고양이 일러스트만 은은하게 떠 있음.
// 진입 시 인사 말풍선을 잠깐 보여주고 자동으로 접어 화면을 어지럽히지 않음.
export default function FloatingChat({ nav }) {
  return (
    <div
      className="chatbot-fab"
      role="button"
      aria-label="쀼냥 AI 상담 열기"
      onClick={() => nav('chat')}
    >
      <div className="chatbot-fab__bubble">고민이 있나요? 🐾</div>
      <img className="chatbot-fab__img" src={CAT_CHAT} alt="쀼냥이 챗봇" />
    </div>
  )
}

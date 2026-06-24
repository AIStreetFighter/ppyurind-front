import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'

const SITUATIONS = [
  { key: '사과하기',    emoji: '🙏', label: '사과하기' },
  { key: '대화 시작',  emoji: '💬', label: '대화 시작하기' },
  { key: '서운함 전달', emoji: '💧', label: '서운함 전달하기' },
  { key: '화해 요청',  emoji: '🤝', label: '화해 요청하기' },
]

const RECOMMENDED = {
  '사과하기': [
    '내가 그때 그렇게 말해서 정말 미안해. 네 마음이 많이 상했을 것 같아.',
    '솔직하게 말 못 해서 더 미안해. 앞으로는 더 잘할게.',
    '내가 잘못했어. 그때 좀 더 신경 썼어야 했는데.',
  ],
  '대화 시작': [
    '요즘 우리 대화가 좀 부족한 것 같아서, 오늘 잠깐 얘기해볼 수 있을까?',
    '바쁜 거 알지만, 오늘 좀 이야기 나눌 수 있어?',
    '하고 싶은 말이 있는데, 편한 시간에 들어줄 수 있어?',
  ],
  '서운함 전달': [
    '네가 그렇게 했을 때 나는 좀 서운했어. 그냥 넘기기가 어려웠어.',
    '내 마음을 잘 모르는 것 같아서 속상했어. 이야기해도 될까?',
    '작은 거라도 알아줬으면 했는데, 그게 안 돼서 서운했어.',
  ],
  '화해 요청': [
    '우리 이제 그만 풀었으면 해. 나도 네가 보고 싶어.',
    '싸우고 나면 항상 네가 보고 싶더라. 화해하자.',
    '이렇게 있기 싫어. 오늘 잠깐 얘기해볼 수 있을까?',
  ],
}

function mockConvert(text) {
  if (!text.trim()) return ''
  if (text.includes('핸드폰') || text.includes('폰') || text.includes('안 들어'))
    return '요즘 같이 있을 때 핸드폰 보는 시간이 많아서 좀 서운했어. 나랑 얘기하는 시간을 조금 더 가지고 싶어.'
  if (text.includes('미안') || text.includes('잘못'))
    return '내가 그때 더 신경 써야 했는데 그러지 못해서 미안해. 다음엔 더 잘할게.'
  if (text.includes('서운') || text.includes('속상'))
    return '그때 좀 서운했어. 이야기하기 어려웠는데 말하고 싶었어. 들어줄 수 있어?'
  return '네 마음이 어땠을지 생각해봤어. 우리 오늘 잠깐 이야기 나눠볼 수 있을까?'
}

export default function Translate({ nav, isDark, toggleTheme }) {
  const [inputText,   setInputText]   = useState('')
  const [converted,   setConverted]   = useState('')
  const [showResult,  setShowResult]  = useState(false)
  const [expanded,    setExpanded]    = useState(null)

  const handleConvert = () => {
    if (!inputText.trim()) return
    setConverted(mockConvert(inputText))
    setShowResult(true)
  }

  const handlePickPhrase = (phrase) => {
    setInputText(phrase)
    setShowResult(false)
    setExpanded(null)
  }

  const toggleExpand = (key) => {
    setExpanded(prev => prev === key ? null : key)
  }

  return (
    <div className="phone-body">
      {/* 상단 */}
      <div className="topbar">
        <div />
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>

      {/* 헤더 */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: -0.3 }}>
          마음을 다듬어 전달하기
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.55 }}>
          같은 마음도, 표현 방식에 따라 다르게 전해져요
        </p>
      </div>

      {/* 입력 */}
      <p style={{ margin: '0 0 10px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-soft)' }}>
        전하고 싶은 말
      </p>
      <textarea
        className="field"
        style={{ width: '100%', minHeight: 120, resize: 'none', fontFamily: 'inherit' }}
        placeholder={'넌 항상 핸드폰만 보고 내 말은 안 들어.\n정말 너무하다.'}
        value={inputText}
        onChange={e => { setInputText(e.target.value); setShowResult(false) }}
      />

      <button
        className="cta"
        style={{ marginTop: 14, opacity: inputText.trim() ? 1 : 0.45 }}
        onClick={handleConvert}
      >
        변환하기
      </button>

      {/* 변환 결과 */}
      {showResult && (
        <div style={{ marginTop: 24 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-soft)' }}>
            변환된 표현
          </p>
          <div className="ba ba--after" style={{ marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7, color: 'var(--ink)' }}>
              "{converted}"
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="cta cta--ghost"
              style={{ flex: 1 }}
              onClick={() => navigator.clipboard?.writeText(converted)}
            >
              복사하기
            </button>
            <button className="cta" style={{ flex: 1.6 }}>
              <i className="fa-solid fa-paper-plane" style={{ marginRight: 6 }}></i>카톡으로 보내기
            </button>
          </div>
        </div>
      )}

      {/* 상황별 추천 문장 */}
      <div style={{ marginTop: 36, marginBottom: 8 }}>
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
          상황별 추천 문장
        </p>
      </div>

      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--surface-line)', background: 'var(--surface)' }}>
        {SITUATIONS.map((s, idx) => (
          <div key={s.key}>
            {/* 구분선 */}
            {idx > 0 && <div style={{ height: 1, background: 'var(--surface-line)' }} />}

            {/* 항목 행 */}
            <div
              style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', cursor: 'pointer', gap: 12 }}
              onClick={() => toggleExpand(s.key)}
            >
              <span style={{ fontSize: 20 }}>{s.emoji}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{s.label}</span>
              <i
                className={`fa-solid fa-chevron-${expanded === s.key ? 'up' : 'right'}`}
                style={{ fontSize: 12, color: 'var(--ink-muted)', transition: 'transform .2s' }}
              />
            </div>

            {/* 펼쳐진 추천 목록 */}
            {expanded === s.key && (
              <div style={{ background: 'var(--bg-2)', padding: '4px 0 8px' }}>
                {RECOMMENDED[s.key].map((phrase, i) => (
                  <div
                    key={i}
                    style={{ padding: '12px 18px 12px 52px', cursor: 'pointer', borderTop: i > 0 ? '1px solid var(--surface-line)' : 'none' }}
                    onClick={() => handlePickPhrase(phrase)}
                  >
                    <p style={{ margin: '0 0 5px', fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{phrase}</p>
                    <span style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 600 }}>
                      입력창으로 가져오기
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav active="필터" nav={nav} />
    </div>
  )
}

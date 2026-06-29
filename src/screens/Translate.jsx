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

const TONES = ['부드럽게', '솔직하게', '카톡용 짧게', '요청형']

// 각 톤·상황마다 여러 변형을 두고, '다시 변환' 시 순환하며 다른 표현을 보여준다.
const TONE_RESULTS = {
  '부드럽게': {
    phone: [
      '요즘 같이 있을 때 핸드폰 보는 시간이 많아서 좀 서운했어. 나랑 얘기하는 시간을 조금 더 가지고 싶어.',
      '같이 있어도 핸드폰만 보면 나 혼자인 것 같아 조금 쓸쓸해. 우리 대화 시간을 조금만 늘려볼까?',
      '네가 핸드폰에 집중할 때 가끔 거리감이 느껴져. 잠깐이라도 눈 마주치고 얘기하고 싶어.',
    ],
    sorry: [
      '내가 그때 더 신경 써야 했는데 그러지 못해서 미안해. 다음엔 더 잘할게.',
      '그때 일은 내가 더 챙겼어야 했어. 미안한 마음이야. 앞으로 더 신경 쓸게.',
      '내 말이 너를 속상하게 했구나. 정말 미안해, 그럴 의도는 아니었어.',
    ],
    sad: [
      '그때 좀 서운했어. 이야기하기 어려웠는데 말하고 싶었어. 들어줄 수 있어?',
      '그날은 마음이 좀 무거웠어. 말 꺼내기 어려웠지만 너랑 나누고 싶었어.',
      '솔직히 마음 한켠이 서운했어. 네가 알아줬으면 해서 용기 내봤어.',
    ],
    default: [
      '네 마음이 어땠을지 생각해봤어. 우리 오늘 잠깐 이야기 나눠볼 수 있을까?',
      '네 마음을 더 알고 싶어. 시간 될 때 잠깐 이야기 나눌 수 있을까?',
      '요즘 네 생각을 많이 했어. 편할 때 잠깐 얘기해줄 수 있어?',
    ],
  },
  '솔직하게': {
    phone: [
      '솔직히 요즘 같이 있어도 핸드폰만 보니까 나 혼자 있는 것 같아. 그게 많이 힘들어.',
      '솔직히 같이 있는데 핸드폰만 보면 좀 서운해. 나한테도 시간 좀 내줘.',
      '같이 있을 때 폰만 보면 내가 뒷전인 것 같아. 솔직히 그게 속상해.',
    ],
    sorry: [
      '내가 잘못한 거 알아. 변명 없이 그냥 미안하다고 말하고 싶었어.',
      '핑계 대고 싶지 않아. 내가 잘못했고, 그래서 미안해.',
      '돌이켜보니 내 잘못이 맞아. 솔직하게 사과할게, 미안해.',
    ],
    sad: [
      '솔직히 그때 많이 서운했어. 그냥 넘기기가 싫어서 말하는 거야.',
      '그때 진짜 서운했어. 그냥 넘어가기엔 마음에 남아서 말하는 거야.',
      '솔직히 아직도 그때 생각하면 좀 서운해. 그래서 얘기 꺼내봐.',
    ],
    default: [
      '하고 싶은 말이 있어. 지금 얘기할 수 있어?',
      '할 말이 있어서 그래. 잠깐 시간 내줄 수 있어?',
      '솔직하게 털어놓고 싶은 게 있어. 들어줄 수 있어?',
    ],
  },
  '카톡용 짧게': {
    phone: [
      '요즘 같이 있을 때 핸드폰 많이 보는 것 같아서ㅠ 나도 좀 봐줘',
      '같이 있을 때 폰 그만 보고 나도 봐줘ㅎㅎ',
      '폰만 보지 말구ㅠ 나랑도 좀 놀자',
    ],
    sorry: [
      '아까 미안했어ㅠ 그런 뜻 아니었는데',
      '아까는 미안ㅠ 진심 그런 뜻 아니었어',
      '미안해ㅠㅠ 내가 좀 심했어',
    ],
    sad: [
      '솔직히 그때 좀 서운했어ㅠ 나중에 얘기해도 돼?',
      '그때 좀 서운했어ㅠ 담에 얘기하자',
      '사실 좀 서운했어ㅠ 시간 날 때 얘기하자',
    ],
    default: [
      '나 할 말 있어, 시간 돼?',
      '할 말 있는뎅 시간 돼?',
      '잠깐 얘기 좀 할 수 있어?',
    ],
  },
  '요청형': {
    phone: [
      '같이 있을 때 핸드폰 보는 시간을 조금만 줄여줄 수 있어? 나랑 더 얘기하고 싶어.',
      '같이 있을 땐 폰 잠깐 내려놓고 나랑 얘기해줄 수 있을까?',
      '우리 같이 있을 땐 핸드폰 잠깐만 멀리해줄 수 있어? 그 시간이 소중해서.',
    ],
    sorry: [
      '내가 그때 그렇게 한 거 반성하고 있어. 한 번만 더 믿어줄 수 있어?',
      '내가 반성하고 있어. 한 번만 기회를 더 줄 수 있을까?',
      '진심으로 뉘우치고 있어. 다시 한번 믿어줄 수 있을까?',
    ],
    sad: [
      '서운했던 마음, 한번 들어줄 수 있어? 오래 걸리지 않을게.',
      '서운했던 얘기 잠깐 들어줄 수 있어? 금방 끝나.',
      '마음에 남은 게 있는데 잠깐 들어줄 수 있을까?',
    ],
    default: [
      '오늘 잠깐 우리 이야기 나눠볼 수 있을까? 듣고만 있어줘도 돼.',
      '우리 잠깐 얘기 나눠볼 수 있을까? 들어주기만 해도 좋아.',
      '시간 될 때 잠깐만 이야기 나눠줄 수 있어? 부담 갖지 말고.',
    ],
  },
}

function mockConvert(text, tone, variant = 0) {
  if (!text.trim()) return ''
  const results = TONE_RESULTS[tone] ?? TONE_RESULTS['부드럽게']
  let arr = results.default
  if (text.includes('핸드폰') || text.includes('폰') || text.includes('안 들어')) arr = results.phone
  else if (text.includes('미안') || text.includes('잘못')) arr = results.sorry
  else if (text.includes('서운') || text.includes('속상')) arr = results.sad
  return arr[((variant % arr.length) + arr.length) % arr.length]
}

export default function Translate({ nav, isDark, toggleTheme }) {
  const [inputText,   setInputText]   = useState('')
  const [tone,        setTone]        = useState('부드럽게')
  const [converted,   setConverted]   = useState('')
  const [showResult,  setShowResult]  = useState(false)
  const [expanded,    setExpanded]    = useState(null)
  const [copied,      setCopied]      = useState(false)
  const [copiedPhrase, setCopiedPhrase] = useState(null)
  const [variant,     setVariant]     = useState(0)

  const handleConvert = () => {
    if (!inputText.trim()) return
    setVariant(0)
    setConverted(mockConvert(inputText, tone, 0))
    setShowResult(true)
    setCopied(false)
  }

  const handleRegenerate = () => {
    const next = variant + 1
    setVariant(next)
    setConverted(mockConvert(inputText, tone, next))
    setCopied(false)
  }

  const handleCopy = () => {
    // 따옴표 자동 제거 후 복사
    const clean = converted.replace(/["“”'']/g, '').trim()
    navigator.clipboard?.writeText(clean)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleToneChange = (t) => {
    setTone(t)
    setShowResult(false)
  }

  const handleCopyPhrase = (phrase, e) => {
    e.stopPropagation()
    navigator.clipboard?.writeText(phrase.replace(/["“”'']/g, '').trim())
    setCopiedPhrase(phrase)
    setTimeout(() => setCopiedPhrase(null), 1600)
  }

  const toggleExpand = (key) => {
    setExpanded(prev => prev === key ? null : key)
  }

  return (
    <div className="phone-body">
      {/* 상단 */}
      <div className="topbar">
        <div className="backbar-inline">
          <i className="fa-solid fa-arrow-left" onClick={() => nav('home')}></i>
          <p className="eyebrow" style={{ margin: 0 }}>대화 어시스턴트</p>
        </div>
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

      {/* 말투 선택 */}
      <p style={{ margin: '16px 0 10px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-soft)' }}>
        말투 선택
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TONES.map(t => (
          <button
            key={t}
            onClick={() => handleToneChange(t)}
            style={{
              padding: '9px 16px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: tone === t ? 600 : 400,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: tone === t ? '1.5px solid var(--brand)' : '1.5px solid var(--surface-line)',
              background: tone === t ? 'var(--brand)' : 'var(--surface)',
              color: tone === t ? '#fff' : 'var(--ink-soft)',
              transition: 'all .15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        className="cta"
        style={{ marginTop: 16, opacity: inputText.trim() ? 1 : 0.45 }}
        onClick={handleConvert}
      >
        변환하기
      </button>

      {/* 변환 결과 */}
      {showResult && (
        <div style={{ marginTop: 24 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>변환된 표현 <span style={{ color: 'var(--ink-muted)', fontWeight: 400 }}>· 직접 다듬어도 돼요</span></span>
            {copied && <span style={{ color: 'var(--brand-soft-text)', fontSize: 12.5 }}><i className="fa-solid fa-check" style={{ marginRight: 4 }}></i>복사됨</span>}
          </p>
          <div className="ba ba--after" style={{ marginBottom: 14 }}>
            <span className="ba-label" style={{ color: 'var(--brand-soft-text)' }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 5 }}></i>{tone}
            </span>
            <textarea
              value={converted}
              onChange={e => setConverted(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', resize: 'none',
                       fontFamily: 'inherit', fontSize: 15.5, lineHeight: 1.7, color: 'var(--ink)',
                       minHeight: 72, outline: 'none', padding: 0 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="cta cta--ghost" style={{ flex: 1 }} onClick={handleRegenerate}>
              <i className="fa-solid fa-rotate" style={{ marginRight: 6 }}></i>다시 변환
            </button>
            <button className="cta" style={{ flex: 1.4 }} onClick={handleCopy}>
              <i className="fa-regular fa-copy" style={{ marginRight: 6 }}></i>복사하기
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

            {/* 펼쳐진 추천 목록 — 이미 다듬어진 문장이라 복사만 */}
            {expanded === s.key && (
              <div style={{ background: 'var(--bg-2)', padding: '4px 0 8px' }}>
                {RECOMMENDED[s.key].map((phrase, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px 12px 52px', borderTop: i > 0 ? '1px solid var(--surface-line)' : 'none' }}
                  >
                    <p style={{ margin: 0, flex: 1, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{phrase}</p>
                    <button className="copy-chip" onClick={(e) => handleCopyPhrase(phrase, e)}>
                      {copiedPhrase === phrase
                        ? <><i className="fa-solid fa-check"></i> 복사됨</>
                        : <><i className="fa-regular fa-copy"></i> 복사</>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav active="홈" nav={nav} />
    </div>
  )
}

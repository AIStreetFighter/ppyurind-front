import { useState, useRef } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import BottomNav from '../components/BottomNav'
import SafetyCard from '../components/SafetyCard'
import { analyzeEmotion, createEmotion, createCommunityPost, getSpeechToken, uploadOcrImage } from '../api/ppyurindApi'

export default function Record({ nav, isDark, toggleTheme }) {
  const [tab, setTab] = useState('텍스트')
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [liveText, setLiveText] = useState('')   // 실시간 인식 자막
  const [mediaError, setMediaError] = useState('') // 음성/캡처 탭 인라인 오류
  const [sharePopup, setSharePopup] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const recognizerRef = useRef(null)

  // ── 음성 STT ────────────────────────────────────────────────
  const startRecording = async () => {
    setMediaError('')
    setLiveText('')
    try {
      const { token, region } = await getSpeechToken()
      const SpeechSDK = await import('microsoft-cognitiveservices-speech-sdk')
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)
      speechConfig.speechRecognitionLanguage = 'ko-KR'
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig)
      recognizerRef.current = recognizer

      recognizer.recognizing = (_, e) => { setLiveText(e.result.text) }
      recognizer.recognized  = (_, e) => {
        if (e.result.text) {
          setText(prev => prev ? prev + ' ' + e.result.text : e.result.text)
          setLiveText('')
        }
      }
      recognizer.startContinuousRecognitionAsync()
      setRecording(true)
    } catch {
      setMediaError('음성 인식 서비스 준비 중이에요. 텍스트 탭에서 직접 입력해주세요.')
    }
  }

  const stopRecording = () => {
    setRecording(false)
    setLiveText('')
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(
        () => { recognizerRef.current?.close(); recognizerRef.current = null },
        () => { recognizerRef.current = null },
      )
    }
  }

  // ── 대화 캡처 OCR ────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaError('')
    try {
      const result = await uploadOcrImage(file)
      setText(result.masked_text || result.text || '')
    } catch {
      setMediaError('이미지 분석 서비스 준비 중이에요. 텍스트 탭에서 직접 입력해주세요.')
    }
  }

  // ── 분석 실행 ────────────────────────────────────────────────
  const goAnalyze = async (share) => {
    setSharePopup(false)
    if (!text.trim()) { nav('analysisResult'); return }
    setAnalyzing(true)
    setError('')
    const inputType = tab === '음성' ? 'voice' : tab === '대화 캡처' ? 'image' : 'text'
    try {
      const result = await analyzeEmotion({ rawContent: text.trim(), inputType })
      const saved = await createEmotion({ rawContent: text.trim(), inputType, isSecretExcluded: !share }).catch(() => null)
      if (share && saved?.id) {
        await createCommunityPost({ content: text.trim(), isAnonymous: true, sourceRecordId: saved.id }).catch(() => {})
      }
      nav('analysisResult', { result, shared: share, rawContent: text.trim() })
    } catch {
      setError('분석 서버에 연결하지 못했어요. 예시 결과를 보여드릴게요.')
      setTimeout(() => { setAnalyzing(false); nav('analysisResult', { rawContent: text.trim() }) }, 1200)
    }
  }

  return (
    <div className="phone-body">
      <div className="topbar">
        <p className="eyebrow">속마음 기록</p>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        </div>
      </div>

      <div style={{ marginTop: 14 }} />
      <div className="seg">
        {['텍스트', '음성', '대화 캡처'].map(t => (
          <div key={t} className={`seg-item${tab === t ? ' active' : ''}`} onClick={() => {
            setTab(t); setMediaError('')
            if (recording) stopRecording()
          }}>{t}</div>
        ))}
      </div>

      {/* 텍스트 탭 */}
      {tab === '텍스트' && (
        <textarea
          className="field"
          style={{ marginTop: 14, minHeight: 168, width: '100%', resize: 'none', fontFamily: 'inherit' }}
          placeholder="속마음 혹은 오늘 나에 대해 새롭게 알게 된 것을 기록해보세요."
          value={text}
          onChange={e => setText(e.target.value)}
        />
      )}

      {/* 음성 탭 */}
      {tab === '음성' && (
        <div className="field" style={{ marginTop: 14, minHeight: 148, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <button
            className={`mic-btn${recording ? ' rec' : ''}`}
            onClick={() => recording ? stopRecording() : startRecording()}
          >
            <i className="fa-solid fa-microphone"></i>
          </button>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center' }}>
            {recording ? '듣고 있어요… 편하게 말해보세요' : '눌러서 음성으로 기록하기'}
          </p>
          {recording && (
            <div className="wave">{[...Array(9)].map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.09}s` }} />)}</div>
          )}
          {liveText && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-muted)', fontStyle: 'italic', textAlign: 'center', maxWidth: '90%' }}>
              {liveText}
            </p>
          )}
          {text && !recording && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center', maxWidth: '90%', lineHeight: 1.55 }}>
              인식된 내용: {text}
            </p>
          )}
          {mediaError && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--like)', textAlign: 'center' }}>{mediaError}</p>}
        </div>
      )}

      {/* 대화 캡처 탭 */}
      {tab === '대화 캡처' && (
        <>
          <label className="field upload" style={{ marginTop: 14, minHeight: 148 }}>
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
            <i className="fa-regular fa-image" style={{ fontSize: 30, color: 'var(--brand)' }}></i>
            <p style={{ margin: '10px 0 2px', fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>카톡 대화 캡처를 올려주세요</p>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-muted)' }}>AI가 대화 흐름을 읽고 감정을 분석해요 · 사진첩에서 선택</p>
          </label>
          {text && (
            <div className="field" style={{ marginTop: 10, fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6, pointerEvents: 'none' }}>
              {text}
            </div>
          )}
          {mediaError && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--like)' }}>{mediaError}</p>}
        </>
      )}

      <p className="record-hint"><i className="fa-solid fa-wand-magic-sparkles"></i> 기록하면 AI가 어떤 감정이 담겼는지 분석해서 보여드려요.</p>

      {/* 나만의 비밀노트 */}
      <div className="section-label"><i className="fa-solid fa-lock"></i>나만의 비밀노트</div>
      <div className="card" style={{ padding: '6px 18px' }} onClick={() => nav('mypage')}>
        <div className="menu-item">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span className="mlabel">조심해야 할 대화 주제</span>
          <i className="fa-solid fa-chevron-right chev"></i>
        </div>
        <div className="menu-item">
          <i className="fa-solid fa-mug-hot"></i>
          <span className="mlabel">기분 풀리는 치트키</span>
          <i className="fa-solid fa-chevron-right chev"></i>
        </div>
        <div className="menu-item">
          <i className="fa-solid fa-gift"></i>
          <span className="mlabel">흘려 말한 위시리스트</span>
          <i className="fa-solid fa-chevron-right chev"></i>
        </div>
      </div>

      {/* 상담기관 연결 (토글형) */}
      <div style={{ marginTop: 22 }}><SafetyCard collapsible nav={nav} /></div>

      <button className="cta" style={{ marginTop: 20 }} onClick={() => setSharePopup(true)}>
        <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 7 }}></i>AI 감정 분석하기
      </button>

      {sharePopup && (
        <div className="sheet-backdrop" onClick={() => setSharePopup(false)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <i className="fa-solid fa-user-secret" style={{ fontSize: 26, color: 'var(--brand)' }}></i>
            <h3 style={{ margin: '12px 0 6px', fontSize: 18, color: 'var(--ink)' }}>이 기록을 익명으로 나눌까요?</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              공유하면 비슷한 고민의 사람들에게 닿을 수 있어요.<br />이름·날짜 등 <b style={{ color: 'var(--ink)' }}>개인정보는 자동으로 제거</b>돼요.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => goAnalyze(false)}>나만 보기</button>
              <button className="cta" style={{ flex: 1 }} onClick={() => goAnalyze(true)}>익명 공유</button>
            </div>
          </div>
        </div>
      )}

      {analyzing && (
        <div className="sheet-backdrop" style={{ alignItems: 'center', justifyContent: 'center', padding: 22 }}>
          <div className="modal" style={{ textAlign: 'center' }}>
            <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 28, color: 'var(--brand)' }}></i>
            <h3 style={{ margin: '12px 0 6px', fontSize: 18, color: 'var(--ink)' }}>마음을 들여다보는 중…</h3>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              {error || 'AI가 기록 속 감정을 분석하고 있어요'}
            </p>
          </div>
        </div>
      )}

      <BottomNav active="기록" nav={nav} />
    </div>
  )
}

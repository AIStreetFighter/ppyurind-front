import { useState, useRef } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import BottomNav from '../components/BottomNav'
import SafetyCard from '../components/SafetyCard'
import { analyzeEmotion, createCommunityPost, getSpeechToken, uploadOcrImage } from '../api/ppyurindApi'
import { mapCommunityPostToLocal, saveMyCommunityPost } from '../utils/myCommunityPosts'

const LAST_EMOTION_KEY = 'ppyurind:lastEmotion'

function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(''))
  const setB = new Set(b.split(''))
  const intersection = [...setA].filter(c => setB.has(c)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 1 : intersection / union
}

function getLastEmotion() {
  try { return JSON.parse(localStorage.getItem(LAST_EMOTION_KEY) || 'null') } catch { return null }
}

function saveLastEmotion(id, text) {
  localStorage.setItem(LAST_EMOTION_KEY, JSON.stringify({ id, text, ts: Date.now() }))
}

function isDuplicate(text) {
  const last = getLastEmotion()
  if (!last) return false
  const elapsed = (Date.now() - last.ts) / 60000 // 분
  if (elapsed > 5) return false
  return jaccardSimilarity(text, last.text) >= 0.8
}

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
    const trimmed = text.trim()

    // ── 1단계: 감정 분석 ─────────────────────────────────────────
    // 중복 판단은 백엔드 /emotions/analyze 에서 처리 (dedup_window 5분, similarity 80%)
    let result
    try {
      result = await analyzeEmotion({ rawContent: trimmed, inputType })
      if (result?.id) saveLastEmotion(result.id, trimmed)
    } catch (err) {
      const status = err?.status
      const msg = status === 401
        ? '로그인이 필요해요. 다시 로그인해주세요.'
        : status === 422
          ? '입력 형식 오류예요. 내용을 확인해주세요.'
          : status >= 500
            ? `서버 오류가 발생했어요 (${status}). 잠시 후 다시 시도해주세요.`
            : '분석 서버에 연결하지 못했어요. 예시 결과를 보여드릴게요.'
      setError(msg)
      setTimeout(() => { setAnalyzing(false); nav('analysisResult', { rawContent: trimmed }) }, 1800)
      return
    }

    // ── 2단계: 커뮤니티 공유 (선택, 실패해도 분석 결과는 표시) ──────
    let shareSuccess = false
    if (share) {
      const recordId = result?.id ?? result?.record_id
      if (recordId) {
        try {
          const emotion = result?.primary_emotion || result?.primaryEmotion || ''
          const autoTitle = emotion ? `${emotion}을(를) 느낀 이야기` : '속마음 기록'
          const post = await createCommunityPost({
            content: trimmed,
            title: autoTitle,
            isAnonymous: true,
            sourceRecordId: recordId,
          })
          saveMyCommunityPost(mapCommunityPostToLocal(post, {
            title: autoTitle,
            body: trimmed,
            tag: emotion ? `AI 태그: ${emotion}` : '',
          }))
          shareSuccess = true
        } catch {
          // 공유 실패 — 분석 결과 화면에서 shareSuccess=false로 표시
        }
      }
    }

    nav('analysisResult', { result, shared: share ? shareSuccess : false, rawContent: trimmed })
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
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 마이크 컨트롤 */}
          <div className="field" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 16px' }}>
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
            {mediaError && <p style={{ margin: 0, fontSize: 12.5, color: 'var(--like)', textAlign: 'center' }}>{mediaError}</p>}
          </div>

          {/* 실시간 STT 자막 영역 */}
          {recording && (
            <div style={{
              borderRadius: 14, overflow: 'hidden',
              border: '1.5px solid var(--brand)',
              background: 'var(--surface)',
            }}>
              {/* 헤더 */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', background: 'var(--brand)',
              }}>
                <span style={{
                  display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                  background: '#fff', animation: 'pulse 1.2s ease-in-out infinite',
                }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: '0.02em' }}>
                  실시간 받아쓰기
                </span>
              </div>
              {/* 자막 */}
              <div style={{ padding: '12px 16px', minHeight: 52 }}>
                {liveText ? (
                  <p style={{
                    margin: 0, fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.7,
                    fontStyle: 'italic', opacity: 0.85,
                  }}>
                    {liveText}
                    <span style={{ display: 'inline-block', width: 2, height: '1em', background: 'var(--brand)', marginLeft: 3, verticalAlign: 'middle', animation: 'pulse 0.9s step-start infinite' }} />
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)', fontStyle: 'italic' }}>
                    말하면 여기에 실시간으로 표시돼요…
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 인식 완료된 텍스트 */}
          {text && (
            <div style={{
              borderRadius: 14, border: '1px solid var(--surface-line)',
              background: 'var(--bg-2)', padding: '12px 16px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                기록된 내용
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>{text}</p>
            </div>
          )}
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

import { useState } from 'react'
import { login, register } from '../api/ppyurindApi'

export default function EmailAuth({ nav, isDark }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loginFailed, setLoginFailed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoginFailed(false)
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
        nav('home')
      } else {
        await register({ nickname: nickname || '새싹', email, password })
        nav('onboarding')
      }
    } catch (err) {
      const msg = err.message || '오류가 발생했어요. 다시 시도해주세요.'
      setError(msg)
      if (mode === 'login') setLoginFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError('')
    setLoginFailed(false)
  }

  // ── 로그인 실패 화면 ──────────────────────────────────────────────
  if (loginFailed) {
    return (
      <div className="phone-body phone-body--flat" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100dvh', padding: '0 28px 40px',
        textAlign: 'center',
      }}>
        <img
          src="/assets/cats2_no_bg.png"
          alt="로그인 실패"
          style={{ width: 210, marginBottom: 0, userSelect: 'none' }}
        />
        <h2 style={{ margin: '4px 0 10px', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>
          앗, 로그인에 실패했어요
        </h2>
        <p style={{ margin: '0 0 6px', fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          {error || '이메일 또는 비밀번호를 확인해주세요.'}
        </p>
        <p style={{ margin: '0 0 32px', fontSize: 13, color: 'var(--ink-muted)' }}>
          혹시 소셜 로그인으로 가입하셨나요?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button
            className="cta"
            onClick={() => { setLoginFailed(false); setError(''); setPassword('') }}
          >
            다시 시도하기
          </button>
          <button
            className="cta cta--ghost"
            onClick={() => nav('kakaoLogin')}
          >
            소셜 로그인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // ── 회원가입 화면 ──────────────────────────────────────────────
  if (mode === 'register') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        minHeight: '100dvh', background: 'var(--bg)',
      }}>
        {/* 상단 뒤로 */}
        <div style={{ padding: '20px 24px 0' }}>
          <i className="fa-solid fa-arrow-left"
            style={{ cursor: 'pointer', fontSize: 18, color: 'var(--ink)' }}
            onClick={() => switchMode('login')} />
        </div>

        {/* 캐릭터 + 인사말 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
          <img
            src="/assets/cats_no_bg.png"
            alt="쀼라인드 캐릭터"
            style={{ width: 160, userSelect: 'none' }}
          />
          <img
            src={isDark ? '/assets/annyeonghaseyo_white.png' : '/assets/annyeonghaseyo_purple.png'}
            alt="안녕하세요!"
            style={{ width: 220, marginTop: 2, userSelect: 'none' }}
          />
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: 'var(--ink-muted)' }}>
            가입 정보를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <div style={{ flex: 1, padding: '22px 28px 48px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>닉네임</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="쀼라인드에서 사용할 이름"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={10}
              />
            </div>
            <div>
              <label style={labelStyle}>이메일</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>비밀번호</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="8자 이상 입력해주세요"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--like)', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8, width: '100%', padding: '17px', border: 'none',
                borderRadius: 15, cursor: 'pointer', background: 'var(--brand)',
                color: '#fff', fontFamily: 'Pretendard, sans-serif',
                fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--ink-muted)' }}>
            이미 계정이 있으신가요?{' '}
            <span
              onClick={() => switchMode('login')}
              style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
            >
              로그인
            </span>
          </p>
        </div>
      </div>
    )
  }

  // ── 로그인 화면 ──────────────────────────────────────────────
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '0 28px 52px', minHeight: '100dvh', background: 'var(--bg)',
    }}>
      <div style={{ padding: '20px 0 0' }}>
        <i className="fa-solid fa-arrow-left"
          style={{ cursor: 'pointer', fontSize: 18, color: 'var(--ink)' }}
          onClick={() => nav('kakaoLogin')} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          다시 만났네요 👋
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 14.5, color: 'var(--ink-soft)' }}>
          이메일과 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={labelStyle}>이메일</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>비밀번호</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={1}
            />
          </div>

          {error && !loginFailed && (
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--like)', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, width: '100%', padding: '17px', border: 'none',
              borderRadius: 15, cursor: 'pointer', background: 'var(--brand)',
              color: '#fff', fontFamily: 'Pretendard, sans-serif',
              fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '잠깐만요...' : '로그인'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--ink-muted)' }}>
          계정이 없으신가요?{' '}
          <span
            onClick={() => switchMode('register')}
            style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
          >
            회원가입
          </span>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)',
}
const inputStyle = {
  width: '100%', padding: '14px 16px', border: '1px solid var(--surface-line)',
  borderRadius: 12, background: 'var(--surface)', color: 'var(--ink)',
  fontFamily: 'Pretendard, sans-serif', fontSize: 15, boxSizing: 'border-box',
  outline: 'none',
}

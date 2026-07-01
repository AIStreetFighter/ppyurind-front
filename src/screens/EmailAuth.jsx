import { useState } from 'react'
import { login, register } from '../api/ppyurindApi'

export default function EmailAuth({ nav }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email, password })
        nav('home')
      } else {
        await register({ nickname: '새싹', email, password })
        nav('onboarding')
      }
    } catch (err) {
      setError(err.message || '오류가 발생했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '0 28px 52px', minHeight: '100vh',
    }}>
      {/* 상단 뒤로가기 */}
      <div style={{ padding: '20px 0 0' }}>
        <i className="fa-solid fa-arrow-left"
          style={{ cursor: 'pointer', fontSize: 18, color: 'var(--ink)' }}
          onClick={() => nav('kakaoLogin')} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          {mode === 'login' ? '다시 만났네요 👋' : '처음 오셨나요? 🌱'}
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: 14.5, color: 'var(--ink-soft)' }}>
          {mode === 'login' ? '이메일과 비밀번호를 입력해주세요.' : '간단한 정보로 시작해요.'}
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
              placeholder={mode === 'register' ? '8자 이상 입력해주세요' : '비밀번호 입력'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : 1}
            />
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: 13.5, color: '#e74c3c', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: '100%', padding: '17px', border: 'none', borderRadius: 15, cursor: 'pointer',
              background: 'var(--brand)', color: '#fff',
              fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600,
              letterSpacing: '-0.01em', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '잠깐만요...' : (mode === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 모드 전환 */}
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--ink-muted)' }}>
          {mode === 'login' ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
          >
            {mode === 'login' ? '회원가입' : '로그인'}
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

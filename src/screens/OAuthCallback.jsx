import { useEffect, useState } from 'react'
import { setAccessToken } from '../api/client'

// 백엔드가 /auth/success?token=...&isNew=true 로 리다이렉트해줌
export default function OAuthCallback({ nav }) {
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const isNew = params.get('isNew') === 'true'

    if (token) {
      setAccessToken(token)
      nav(isNew ? 'onboarding' : 'home')
    } else {
      setError('로그인에 실패했어요. 다시 시도해주세요.')
    }
  }, [])

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: 16,
    }}>
      {error ? (
        <>
          <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>{error}</p>
          <button
            onClick={() => nav('kakaoLogin')}
            style={{
              padding: '12px 28px', border: 'none', borderRadius: 12,
              background: 'var(--brand)', color: '#fff',
              fontFamily: 'Pretendard, sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >돌아가기</button>
        </>
      ) : (
        <>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid var(--brand)', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, margin: 0 }}>로그인 중이에요...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </div>
  )
}

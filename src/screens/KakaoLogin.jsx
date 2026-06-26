import ThemeToggle from '../components/ThemeToggle'

export default function KakaoLogin({ nav, isDark, toggleTheme }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px 52px',
      minHeight: '100vh',
    }}>
      {/* 우상단 테마 토글 */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '20px 0 0' }}>
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      </div>

      {/* 중앙 브랜딩 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}>
        <div style={{
          width: 150,
          height: 150,
          borderRadius: 38,
          overflow: 'hidden',
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}>
          <img src="/assets/logo.png" alt="쀼라인드" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)' }} />
        </div>

        <h1 style={{ margin: '0 0 12px', fontSize: 34, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          쀼라인드
        </h1>
        <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65, color: 'var(--ink-soft)', textAlign: 'center' }}>
          속마음을 기록하면<br />AI가 내 마음을 들여다봐 줘요
        </p>

        <div style={{ display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: 'fa-solid fa-pen-nib', label: '감정 기록' },
            { icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI 분석' },
            { icon: 'fa-solid fa-heart', label: '관계 개선' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'var(--surface)', border: '1px solid var(--surface-line)',
              borderRadius: 999, padding: '9px 16px', fontSize: 13, color: 'var(--ink-soft)',
            }}>
              <i className={item.icon} style={{ color: 'var(--brand)', fontSize: 12 }}></i>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {/* 카카오 */}
        <button onClick={() => nav('onboarding')} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#FEE500', border: 'none', borderRadius: 15, padding: '17px', cursor: 'pointer',
          fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.85)',
          letterSpacing: '-0.01em',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.85)">
            <path d="M12 3C6.477 3 2 6.582 2 11c0 2.832 1.69 5.325 4.264 6.878L5.4 21.2a.5.5 0 0 0 .72.568L10.5 19.1c.493.063.993.1 1.5.1 5.523 0 10-3.582 10-8S17.523 3 12 3z"/>
          </svg>
          카카오로 시작하기
        </button>

        {/* 네이버 */}
        <button onClick={() => nav('onboarding')} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#03C75A', border: 'none', borderRadius: 15, padding: '17px', cursor: 'pointer',
          fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: '#fff',
          letterSpacing: '-0.01em',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
            <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z"/>
          </svg>
          네이버로 시작하기
        </button>

        {/* 구글 */}
        <button onClick={() => nav('onboarding')} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#fff', border: '1px solid #DADCE0', borderRadius: 15, padding: '16px', cursor: 'pointer',
          fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.75)',
          letterSpacing: '-0.01em',
        }}>
          <svg width="19" height="19" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
          </svg>
          구글로 시작하기
        </button>

        {/* 이메일 */}
        <button onClick={() => nav('onboarding')} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: 'transparent', border: '1px solid var(--surface-line)', borderRadius: 15, padding: '16px', cursor: 'pointer',
          fontFamily: 'Pretendard, sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--ink-soft)',
          letterSpacing: '-0.01em',
        }}>
          <i className="fa-regular fa-envelope" style={{ fontSize: 16 }}></i>
          이메일로 시작하기
        </button>

        <p style={{ margin: '4px 0 0', textAlign: 'center', fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.6 }}>
          로그인 시 <span style={{ color: 'var(--brand)', fontWeight: 500 }}>개인정보 처리방침</span> 및{' '}
          <span style={{ color: 'var(--brand)', fontWeight: 500 }}>서비스 이용약관</span>에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}

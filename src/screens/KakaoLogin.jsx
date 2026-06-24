export default function KakaoLogin({ nav }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px 52px',
      background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)',
      minHeight: '100vh',
    }}>
      {/* 상단 일러스트 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        paddingTop: 60,
      }}>
        {/* 고양이 일러스트 */}
        <div style={{
          width: 160,
          height: 160,
          borderRadius: 40,
          overflow: 'hidden',
          marginBottom: 32,
          background: 'var(--surface)',
          border: '1px solid var(--surface-line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/assets/cats/cat_pair.png"
            alt="쀼라인드"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* 앱 이름 */}
        <h1 style={{
          margin: '0 0 12px',
          fontSize: 34,
          fontWeight: 800,
          color: 'var(--ink)',
          letterSpacing: '-0.02em',
        }}>
          쀼라인드
        </h1>

        {/* 태그라인 */}
        <p style={{
          margin: 0,
          fontSize: 15.5,
          lineHeight: 1.65,
          color: 'var(--ink-soft)',
          textAlign: 'center',
        }}>
          속마음을 기록하면<br />
          AI가 우리 사이를 이어줘요
        </p>

        {/* 포인트 배지 3개 */}
        <div style={{
          display: 'flex',
          gap: 10,
          marginTop: 32,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {[
            { icon: 'fa-solid fa-pen-nib', label: '감정 기록' },
            { icon: 'fa-solid fa-wand-magic-sparkles', label: 'AI 분석' },
            { icon: 'fa-solid fa-heart', label: '관계 개선' },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'var(--surface)',
              border: '1px solid var(--surface-line)',
              borderRadius: 999,
              padding: '9px 16px',
              fontSize: 13,
              color: 'var(--ink-soft)',
            }}>
              <i className={item.icon} style={{ color: 'var(--brand)', fontSize: 12 }}></i>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 카카오 로그인 버튼 */}
        <button
          onClick={() => nav('onboarding')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: '#FEE500',
            border: 'none',
            borderRadius: 15,
            padding: '17px',
            cursor: 'pointer',
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: 'rgba(0,0,0,0.85)',
            letterSpacing: '-0.01em',
          }}
        >
          {/* 카카오 말풍선 아이콘 SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(0,0,0,0.85)">
            <path d="M12 3C6.477 3 2 6.582 2 11c0 2.832 1.69 5.325 4.264 6.878L5.4 21.2a.5.5 0 0 0 .72.568L10.5 19.1c.493.063.993.1 1.5.1 5.523 0 10-3.582 10-8S17.523 3 12 3z"/>
          </svg>
          카카오로 시작하기
        </button>

        {/* 안내 문구 */}
        <p style={{
          margin: 0,
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--ink-muted)',
          lineHeight: 1.6,
        }}>
          로그인 시 <span style={{ color: 'var(--brand)', fontWeight: 500 }}>개인정보 처리방침</span> 및{' '}
          <span style={{ color: 'var(--brand)', fontWeight: 500 }}>서비스 이용약관</span>에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}

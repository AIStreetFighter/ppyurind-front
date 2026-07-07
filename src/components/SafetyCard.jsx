import { useState } from 'react'

const CONTACT_LABELS = {
  '112': '경찰 신고 112',
  '119': '구급·소방 119',
  '1366': '여성긴급전화 1366',
  '109': '자살예방상담 109',
  '1393': '자살예방상담 1393',
  '1577-0199': '정신건강상담 1577-0199',
}

export default function SafetyCard({ collapsible = false, nav, signal = '', emergency = false, message, contacts = [] }) {
  const [open, setOpen] = useState(!collapsible)

  const emergencyContacts = [...new Set(
    (Array.isArray(contacts) ? contacts : [])
      .map(contact => String(contact).trim())
      .filter(Boolean)
  )]

  const pink = '#e88fa8'
  const pinkBg = 'rgba(232,143,168,0.10)'
  const pinkBorder = 'rgba(232,143,168,0.35)'
  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px 18px', cursor: 'pointer',
    borderBottom: `1px solid ${pinkBorder}`,
    textDecoration: 'none',
  }

  if (emergency) {
    return (
      <section
        aria-label="긴급 안전 안내"
        style={{
          border: '1.5px solid rgba(232,80,80,0.38)', borderRadius: 18,
          background: 'var(--surface)', overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '18px' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,80,80,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fa-solid fa-shield-heart" style={{ color: '#e85050', fontSize: 18 }}></i>
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 16, lineHeight: 1.45, color: 'var(--ink)' }}>지금은 안전을 먼저 확인해야 할 수 있어요</h2>
            <p style={{ margin: '7px 0 0', fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-soft)', whiteSpace: 'pre-wrap' }}>
              {message || '신체적 위험이 임박했다면 안전한 장소로 이동하고, 아래 기관에 도움을 요청해 주세요.'}
            </p>
          </div>
        </div>
        {emergencyContacts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: emergencyContacts.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 8, padding: '0 12px 12px' }}>
            {emergencyContacts.map(contact => (
              <a key={contact} href={`tel:${contact.replace(/[^\d]/g, '')}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minWidth: 0, padding: '13px 8px', borderRadius: 12, background: 'rgba(232,80,80,0.10)', color: 'var(--ink)', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>
                <i className="fa-solid fa-phone" style={{ color: '#e85050', flexShrink: 0 }}></i>
                <span style={{ overflowWrap: 'anywhere', textAlign: 'center' }}>{CONTACT_LABELS[contact] || contact}</span>
              </a>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <div style={{
      border: `1.5px solid ${pinkBorder}`,
      borderRadius: 18,
      background: 'var(--surface)',
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px 14px', cursor: collapsible ? 'pointer' : 'default' }}
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: pinkBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className="fa-solid fa-shield-heart" style={{ color: pink, fontSize: 18 }}></i>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>혼자 감당하기 버겁다면</p>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-muted)' }}>24시간 · 비밀보장으로 연결돼요.</p>
        </div>
        {collapsible && <i className={`fa-solid fa-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--ink-muted)', fontSize: 13 }}></i>}
      </div>

      {open && (
        <>
          {/* 전화 행 */}
          <div style={{ ...rowStyle, cursor: 'default', borderTop: `1px solid ${pinkBorder}` }}>
            <i className="fa-solid fa-phone" style={{ color: pink, fontSize: 15, width: 20, textAlign: 'center' }}></i>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>여성긴급전화 1366</span>
          </div>
          <div style={{ ...rowStyle, cursor: 'default', borderBottom: 'none' }}>
            <i className="fa-solid fa-phone" style={{ color: pink, fontSize: 15, width: 20, textAlign: 'center' }}></i>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>자살예방상담 109</span>
          </div>

          {/* 쉼터 / 상담기관 */}
          <div style={{ display: 'flex', borderTop: `1px solid ${pinkBorder}` }}>
            <button style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '15px 10px', background: 'transparent', border: 'none',
              borderRight: `1px solid ${pinkBorder}`, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: pink, fontFamily: 'inherit',
            }}>
              <i className="fa-regular fa-comment-dots"></i>쉼터 연결
            </button>
            <a href="https://www.counselling.or.kr" target="_blank" rel="noreferrer" style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '15px 10px', background: 'transparent',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: pink,
              textDecoration: 'none',
            }}>
              <i className="fa-regular fa-building"></i>상담기관 연결
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 10 }}></i>
            </a>
          </div>

          {/* 마음건강 자기점검 */}
          {nav && (
            <div style={{ padding: '10px 12px 12px' }}>
              <button onClick={() => nav('checkup', { signal })} style={{
                width: '100%', padding: '15px', border: 'none', borderRadius: 12,
                background: 'var(--brand)', color: '#fff', cursor: 'pointer',
                fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <i className="fa-solid fa-clipboard-check"></i>마음건강 자기점검 해보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

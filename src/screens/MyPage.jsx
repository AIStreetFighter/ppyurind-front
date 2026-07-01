import { useEffect, useState } from 'react'
import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'
import PinPad from '../components/PinPad'
import { logout, deleteMe, updateMe, getDex, addDex, deleteDex, updateNotificationSettings, getMe } from '../api/ppyurindApi'

const DEX_STORAGE_KEY = 'ppyurind:dexItems'

const DEX = [
  {
    key: 'secret', icon: 'fa-wand-magic-sparkles', label: '나만의 비밀 도감', count: 12,
    body: ['"지우님은 해결보다 공감을 먼저 원해요."', '"칭찬은 사람들 앞에서 들을 때 가장 기뻐요."', '"피곤할 땐 말보다 혼자만의 시간이 필요해요."'],
  },
  {
    key: 'partner', icon: 'fa-heart', label: '배우자 이해 노트',
    body: ['결론보다 과정을 먼저 들어주면 마음이 풀려요.', '걱정이 많아 보일 땐 "내가 옆에 있어"라는 말이 가장 커요.'],
  },
  {
    key: 'taboo', icon: 'fa-triangle-exclamation', label: '조심해야 할 대화 주제',
    body: ['외모·체중 관련 농담', '시댁·처가 비교', '예전 연애 이야기'],
  },
  {
    key: 'cheat', icon: 'fa-mug-hot', label: '기분 풀리는 치트키',
    body: ['마라탕 + 탕후루 세트', '말없이 안아주기', '드라이브하며 좋아하는 노래 틀기'],
  },
  {
    key: 'wish', icon: 'fa-gift', label: '흘려 말한 위시리스트',
    body: ['무선 이어폰 (분실함)', '주말 호캉스', '향수 — 우디 계열'],
  },
]

export default function MyPage({ nav, isDark, toggleTheme, nickname }) {
  const [dexItems, setDexItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(DEX_STORAGE_KEY) || 'null') || DEX
    } catch {
      return DEX
    }
  })
  const [open, setOpen] = useState(null)
  const [addTarget, setAddTarget] = useState(null)
  const [dexDraft, setDexDraft] = useState('')
  const [settings, setSettings] = useState(false)
  const [tone, setTone] = useState('부드럽게')
  const [relationLabel, setRelationLabel] = useState('신혼 · 결혼 2년 차')
  const [concernLabel, setConcernLabel] = useState('대화 단절 · 서운함')
  const [push, setPush] = useState({ empathy: true, comment: true, anniv: true })
  const [confirm, setConfirm] = useState(null) // 'logout' | 'withdraw'
  const [pinOpen, setPinOpen] = useState(false)
  const [pinDone, setPinDone] = useState(false)

  const toggleDex = (k) => setOpen(prev => prev === k ? null : k)
  const targetDex = dexItems.find(d => d.key === addTarget)

  useEffect(() => {
    getMe().then(u => {
      if (u.ai_tone) setTone(u.ai_tone)
      if (u.push_empathy != null || u.push_comment != null || u.push_anniversary != null) {
        setPush({ empathy: u.push_empathy ?? true, comment: u.push_comment ?? true, anniv: u.push_anniversary ?? true })
      }
      // 관계 상태 라벨
      const rel = Array.isArray(u.relationship_status) ? u.relationship_status[0] : u.relationship_status
      const years = u.relationship_years
      let relStr = rel || ''
      if (years != null) relStr += ` · ${years === 0 ? '1년 미만' : `결혼 ${years}년 차`}`
      if (relStr) setRelationLabel(relStr)
      // 고민 라벨
      if (Array.isArray(u.main_concern_topics) && u.main_concern_topics.length > 0) {
        setConcernLabel(u.main_concern_topics.slice(0, 3).join(' · '))
      }
    }).catch(() => {})
    getDex().then(items => {
      if (!Array.isArray(items) || items.length === 0) return
      setDexItems(prev => prev.map(d => {
        const apiItems = items.filter(i => i.category === d.key)
        if (!apiItems.length) return d
        return { ...d, body: apiItems.map(i => i.content) }
      }))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem(DEX_STORAGE_KEY, JSON.stringify(dexItems))
  }, [dexItems])

  const openDexAdd = (key) => {
    setOpen(key)
    setAddTarget(key)
    setDexDraft('')
  }

  const submitDexAdd = async () => {
    const value = dexDraft.trim()
    if (!value || !addTarget) return
    addDex({ category: addTarget, content: value }).catch(() => {})
    setDexItems(items => items.map(item => {
      if (item.key !== addTarget) return item
      return {
        ...item,
        count: item.count == null ? undefined : item.count + 1,
        body: [...item.body, value],
      }
    }))
    setDexDraft('')
    setAddTarget(null)
  }

  return (
    <>
      <div className="phone-body">
        <div className="topbar">
          <p className="eyebrow">마이</p>
          <div className="topbar__icons">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <i className="fa-solid fa-gear" style={{ cursor: 'pointer' }} onClick={() => setSettings(true)}></i>
          </div>
        </div>

        <div className="card" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 15 }}>
          <div className="avatar" style={{ width: 56, height: 56 }}>
            <img src="/assets/cats/cat_02_t.png" alt="" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="row__title" style={{ fontSize: 17 }}>{nickname || '들풀'} <span style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 400 }}>#0421</span></p>
            <p className="row__sub">{relationLabel} · 응답 톤: {tone}</p>
          </div>
          <i className="fa-solid fa-pen" style={{ color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' }} onClick={() => setSettings(true)}></i>
        </div>

        {/* 나만의 도감 — 아코디언 */}
        <div className="section-label"><i className="fa-solid fa-book"></i>나만의 도감</div>
        <div className="card" style={{ padding: '4px 0' }}>
          {dexItems.map((d, i) => (
            <div key={d.key} className={`acc${i > 0 ? ' acc--line' : ''}`}>
              <div className="acc-head" onClick={() => toggleDex(d.key)}>
                <i className={`fa-solid ${d.icon} acc-ic`}></i>
                <span className="mlabel" style={{ flex: 1 }}>{d.label}</span>
                {d.count != null && <span className="badge badge--match" style={{ marginRight: 8 }}>{d.count}</span>}
                <i className={`fa-solid fa-chevron-${open === d.key ? 'up' : 'down'} chev`}></i>
              </div>
              {open === d.key && (
                <div className="acc-body">
                  {d.body.map((line, j) => <p key={j} className="acc-line-item">· {line}</p>)}
                  <button className="acc-add" onClick={() => openDexAdd(d.key)}><i className="fa-solid fa-plus"></i> 추가하기</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 배우자 이해 노트(도감) 기반 살짝 광고 */}
        <a className="card mini-ad" href="#" onClick={e => e.preventDefault()}>
          <span className="ad-badge">AD</span>
          <div className="event-emoji" style={{ background: 'color-mix(in srgb, var(--like) 16%, transparent)' }}>🎁</div>
          <div style={{ flex: 1 }}>
            <p className="row__title" style={{ marginBottom: 2 }}>위시리스트 속 '무선 이어폰', 지금 특가예요</p>
            <p className="row__sub">도감 기반 추천 · 제휴</p>
          </div>
          <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
        </a>

        {/* 마음건강 검사 */}
        <div className="section-label"><i className="fa-solid fa-heart-pulse"></i>마음 건강</div>
        <div className="card chk-item" onClick={() => nav('checkup')} style={{ cursor: 'pointer' }}>
          <div className="chk-ic"><i className="fa-solid fa-clipboard-check"></i></div>
          <div style={{ flex: 1 }}>
            <p className="row__title">마음건강 자가점검</p>
            <p className="row__sub">우울·불안 등 검증된 검사 · 상담·지원사업 안내</p>
          </div>
          <i className="fa-solid fa-chevron-right chev" style={{ color: 'var(--ink-muted)' }}></i>
        </div>

        {/* 기록 & 리포트 (병합) */}
        <div className="section-label"><i className="fa-solid fa-folder-open"></i>기록 &amp; 리포트</div>
        <div className="card" style={{ padding: '6px 18px' }}>
          <div className="menu-item" onClick={() => nav('report')}>
            <i className="fa-solid fa-chart-pie"></i>
            <span className="mlabel">내 감정 기록 · 주간/월간 리포트</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item" onClick={() => nav('analysisResult')}>
            <i className="fa-solid fa-comments"></i>
            <span className="mlabel">대화 분석 <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>· 상대와의 대화 기록</span></span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
          <div className="menu-item" onClick={() => nav('myPosts')}>
            <i className="fa-solid fa-pen-nib"></i>
            <span className="mlabel">내가 쓴 커뮤니티 글</span>
            <i className="fa-solid fa-chevron-right chev"></i>
          </div>
        </div>
      </div>

      {/* 설정 시트 */}
      {settings && (
        <div className="sheet-backdrop" onClick={() => setSettings(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 style={{ margin: '0 0 18px', fontSize: 19, color: 'var(--ink)' }}>설정</h2>

            <div className="section-label" style={{ marginTop: 0 }}><i className="fa-solid fa-sliders"></i>맞춤정보 설정</div>
            <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--ink-muted)' }}>가입 시 입력한 정보를 언제든 수정할 수 있어요.</p>
            <div className="setrow"><span>관계 상태</span><b>{relationLabel}</b></div>
            <div className="setrow"><span>주요 고민</span><b>{concernLabel}</b></div>
            <div style={{ margin: '4px 0 6px', fontSize: 13, color: 'var(--ink-soft)' }}>AI 응답 톤</div>
            <div className="chip-row" style={{ marginBottom: 6 }}>
              {['부드럽게', '현실적으로', '공감 중심', '해결책 중심'].map(v => (
                <span key={v} className={`chip chip--sm${tone === v ? ' selected' : ''}`} onClick={() => { setTone(v); updateMe({ ai_tone: v }).catch(() => {}) }}>{v}</span>
              ))}
            </div>

            <div className="section-label"><i className="fa-regular fa-bell"></i>푸시 알림</div>
            {[
              { k: 'empathy', label: '공감 알림' },
              { k: 'comment', label: '댓글 알림' },
              { k: 'anniv', label: '기념일 알림 (일주일 전 · 하루 전)' },
            ].map(p => (
              <div key={p.k} className="toggle-row" style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{p.label}</div>
                <div className={`switch${push[p.k] ? '' : ' off'}`} onClick={() => {
                  const next = { ...push, [p.k]: !push[p.k] }
                  setPush(next)
                  updateNotificationSettings({ notify_empathy: next.empathy, notify_comment: next.comment, notify_anniversary: next.anniv }).catch(() => {})
                }} />
              </div>
            ))}

            <div className="section-label"><i className="fa-solid fa-shield-halved"></i>계정 · 약관</div>
            <div className="card" style={{ padding: '4px 16px' }}>
              <div className="menu-item" onClick={() => nav('legal', { doc: 'privacy', from: 'mypage' })}><i className="fa-solid fa-file-lines"></i><span className="mlabel">개인정보 처리방침</span><i className="fa-solid fa-chevron-right chev"></i></div>
              <div className="menu-item" onClick={() => nav('legal', { doc: 'terms', from: 'mypage' })}><i className="fa-solid fa-file-contract"></i><span className="mlabel">서비스 이용약관</span><i className="fa-solid fa-chevron-right chev"></i></div>
              <div className="menu-item" onClick={toggleTheme}><i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i><span className="mlabel">{isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}</span><i className="fa-solid fa-chevron-right chev"></i></div>
              <div className="menu-item" onClick={() => setPinOpen(true)}><i className="fa-solid fa-lock"></i><span className="mlabel">앱 잠금 비밀번호 {pinDone ? '변경' : '설정'}</span><i className="fa-solid fa-chevron-right chev"></i></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setConfirm('logout')}>로그아웃</button>
              <button className="cta cta--ghost" style={{ flex: 1, color: 'var(--danger-text)', borderColor: 'var(--danger-line)' }} onClick={() => setConfirm('withdraw')}>회원 탈퇴</button>
            </div>
          </div>
        </div>
      )}

      {/* 도감 항목 추가 */}
      {addTarget && (
        <div className="sheet-backdrop" onClick={() => setAddTarget(null)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()} style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--ink)' }}>{targetDex?.label} 추가</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink-muted)' }}>
              기억해두고 싶은 말이나 포인트를 한 줄로 적어주세요.
            </p>
            <textarea
              className="field"
              value={dexDraft}
              onChange={e => setDexDraft(e.target.value)}
              placeholder="예: 피곤한 날에는 조언보다 먼저 안아주는 걸 좋아해요."
              style={{ width: '100%', minHeight: 110, resize: 'none', fontFamily: 'inherit' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setAddTarget(null)}>취소</button>
              <button className="cta" style={{ flex: 1, opacity: dexDraft.trim() ? 1 : 0.5 }} onClick={submitDexAdd}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 로그아웃/탈퇴 확인 */}
      {confirm && (
        <div className="sheet-backdrop" onClick={() => setConfirm(null)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <i className={`fa-solid ${confirm === 'withdraw' ? 'fa-heart-crack' : 'fa-right-from-bracket'}`} style={{ fontSize: 24, color: confirm === 'withdraw' ? 'var(--danger-text)' : 'var(--brand)' }}></i>
            <h3 style={{ margin: '12px 0 6px', fontSize: 18, color: 'var(--ink)' }}>
              {confirm === 'withdraw' ? '정말 탈퇴하시겠어요?' : '로그아웃 할까요?'}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              {confirm === 'withdraw' ? '모든 기록과 도감이 삭제되며 되돌릴 수 없어요.' : '다시 로그인하면 기록을 이어서 볼 수 있어요.'}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="cta cta--ghost" style={{ flex: 1 }} onClick={() => setConfirm(null)}>취소</button>
              <button className="cta" style={{ flex: 1, background: confirm === 'withdraw' ? 'var(--like)' : 'var(--brand)' }} onClick={async () => {
                const action = confirm
                setConfirm(null); setSettings(false)
                if (action === 'withdraw') { await deleteMe().catch(() => {}); nav('kakaoLogin') }
                else { await logout().catch(() => {}); nav('kakaoLogin') }
              }}>
                {confirm === 'withdraw' ? '탈퇴하기' : '로그아웃'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 앱 잠금 PIN 설정/변경 */}
      {pinOpen && (
        <div className="sheet-backdrop" onClick={() => setPinOpen(false)} style={{ alignItems: 'center', padding: 22 }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--ink)' }}>앱 잠금 비밀번호</h3>
            <PinPad onDone={() => { setPinDone(true); setPinOpen(false) }} onCancel={() => setPinOpen(false)} />
          </div>
        </div>
      )}

      <BottomNav active="마이" nav={nav} />
    </>
  )
}

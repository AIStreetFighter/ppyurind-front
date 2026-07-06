import { useState } from 'react'
import { verifyPin, markUnlocked } from '../utils/appLock'
import { LOGO } from '../data/images'

// 앱 시작 시 잠금 해제 화면 — 저장된 PIN과 대조해 통과 시 onUnlock 호출.
export default function LockScreen({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const press = (n) => {
    if (value.length >= 4) return
    const next = value + n
    setValue(next)
    setError(false)
    if (next.length === 4) {
      setTimeout(() => {
        if (verifyPin(next)) {
          markUnlocked()
          onUnlock?.()
        } else {
          setError(true)
          setValue('')
        }
      }, 120)
    }
  }
  const back = () => setValue(v => v.slice(0, -1))

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 28px 40px', gap: 6,
    }}>
      <div style={{ width: 76, height: 76, borderRadius: 22, overflow: 'hidden', marginBottom: 16, boxShadow: '0 10px 30px color-mix(in srgb, var(--brand) 35%, transparent)' }}>
        <img src={LOGO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.35)' }} />
      </div>
      <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, color: 'var(--ink)' }}>잠금 해제</h1>
      <p className="pinpad__label" style={{ marginTop: 6 }}>
        {error ? '비밀번호가 일치하지 않아요. 다시 입력해주세요.' : '비밀번호 4자리를 입력하세요'}
      </p>
      <div className={`pinpad__dots${error ? ' shake' : ''}`} style={{ marginTop: 4 }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`pin-dot${i < value.length ? ' filled' : ''}${error ? ' err' : ''}`} />
        ))}
      </div>
      <div className="pinpad__keys" style={{ marginTop: 18 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} className="pinpad__key" onClick={() => press(String(n))}>{n}</button>
        ))}
        <span className="pinpad__key pinpad__key--ghost" style={{ visibility: 'hidden' }} />
        <button className="pinpad__key" onClick={() => press('0')}>0</button>
        <button className="pinpad__key pinpad__key--ghost" onClick={back}><i className="fa-solid fa-delete-left"></i></button>
      </div>
    </div>
  )
}

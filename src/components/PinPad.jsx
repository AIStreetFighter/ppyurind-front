import { useState } from 'react'

// 4자리 PIN 입력 (입력 → 확인 재입력). 시연용이라 값은 저장하지 않음.
export default function PinPad({ onDone, onCancel }) {
  const [stage, setStage] = useState('enter') // 'enter' | 'confirm'
  const [first, setFirst] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  const press = (n) => {
    if (value.length >= 4) return
    const next = value + n
    setValue(next)
    setError(false)
    if (next.length === 4) {
      setTimeout(() => {
        if (stage === 'enter') {
          setFirst(next)
          setValue('')
          setStage('confirm')
        } else {
          if (next === first) {
            onDone?.(next)
          } else {
            setError(true)
            setValue('')
            setStage('enter')
            setFirst('')
          }
        }
      }, 140)
    }
  }

  const back = () => setValue(v => v.slice(0, -1))

  return (
    <div className="pinpad">
      <p className="pinpad__label">
        {error ? '비밀번호가 일치하지 않아요. 다시 설정해주세요.'
          : stage === 'enter' ? '새 비밀번호 4자리를 입력하세요'
          : '확인을 위해 한 번 더 입력하세요'}
      </p>
      <div className="pinpad__dots">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`pin-dot${i < value.length ? ' filled' : ''}${error ? ' err' : ''}`} />
        ))}
      </div>
      <div className="pinpad__keys">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} className="pinpad__key" onClick={() => press(String(n))}>{n}</button>
        ))}
        <button className="pinpad__key pinpad__key--ghost" onClick={onCancel}>취소</button>
        <button className="pinpad__key" onClick={() => press('0')}>0</button>
        <button className="pinpad__key pinpad__key--ghost" onClick={back}><i className="fa-solid fa-delete-left"></i></button>
      </div>
    </div>
  )
}

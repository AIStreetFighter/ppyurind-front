import { useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'
import BottomNav from '../components/BottomNav'
import SafetyCard from '../components/SafetyCard'
import { exportReportPdf } from '../utils/exportPdf'
// [API] 백엔드 연결 시 아래 import 활성화
// import { getReport } from '../api/ppyurindApi'
//
// [API] 주간/월간 리포트 로드 (현재: REPORTS 더미 객체 사용)
//   useEffect(() => {
//     getReport(period === '주간' ? 'weekly' : 'monthly').then(data => setReport(data))
//   }, [period])
//   응답 필드: period, range, summary, gaslight{score,level}, emotion{neg,neu,pos,tags},
//             phrases[]{text,count,tone}, weekly[]{day,h,mood}, weekly_note
//             (monthly 추가) weeks[]{label,pos}, trend, insight
//   기록 부족 시: { available: false, detail: "..." } → 안내 문구 표시

// 주간 / 월간 리포트 데이터 (실제 서비스에서는 사용자 기록 기반으로 채워짐)
const REPORTS = {
  주간: {
    range: '최근 7일 · 기록 6회 기반',
    summary: '이번 주 기록에서 상대의 말 뒤에 나를 의심하고 자책하는 패턴이 보였어요. 힘든 마음은 충분히 그럴 만하고, 한 걸음 떨어져 사실과 해석을 나눠보면 도움이 될 거예요.',
    gaslight: { score: 11, level: '주의' },
    emotion: { neg: 54, neu: 30, pos: 16, tags: ['자책', '불안', '서운함'] },
    phrases: [
      { text: '내가 예민한 건가', count: 4, tone: 'red' },
      { text: '다 내 탓 같아', count: 3, tone: 'amber' },
      { text: '말해도 소용없어', count: 2, tone: 'gray' },
    ],
    // 주간: 요일별 마음 날씨
    weekly: [
      { day: '월', h: 40, mood: 'neg' }, { day: '화', h: 58, mood: 'neu' },
      { day: '수', h: 30, mood: 'neg' }, { day: '목', h: 64, mood: 'pos' },
      { day: '금', h: 48, mood: 'neu' }, { day: '토', h: 78, mood: 'pos' },
      { day: '일', h: 70, mood: 'pos' },
    ],
    weeklyNote: '주 초반엔 가라앉았다가 주말로 갈수록 한결 편안해졌어요 🌙',
  },
  월간: {
    range: '최근 4주 · 기록 18회 기반',
    summary: '최근 기록에서 상대의 말 뒤에 나를 의심하고 자책하는 패턴이 반복되고 있어요. 힘든 마음은 충분히 그럴 만하고, 한 걸음 떨어져 사실과 해석을 나눠보면 도움이 될 거예요.',
    gaslight: { score: 14, level: '주의' },
    emotion: { neg: 58, neu: 27, pos: 15, tags: ['자책', '불안', '서운함', '위축감'] },
    phrases: [
      { text: '내가 예민한 건가', count: 9, tone: 'red' },
      { text: '다 내 탓 같아', count: 7, tone: 'amber' },
      { text: '말해도 소용없어', count: 5, tone: 'gray' },
    ],
    // 월간: 주차별 추이 + 한 달 인사이트
    weeks: [
      { label: '1주', pos: 20 }, { label: '2주', pos: 28 },
      { label: '3주', pos: 22 }, { label: '4주', pos: 38 },
    ],
    trend: '긍정 감정 비율이 한 달간 20% → 38%로 조금씩 올라왔어요.',
    insight: '갈등 후 바로 자책하기보다, 하루 지나 다시 보면 덜 예민하게 느낀다는 걸 알게 됐어요.',
  },
}

const SPLIT = {
  quote: '오늘도 내 얘기에 한숨 쉬더라. 역시 나는 같이 살기 피곤한 사람인가 봐.',
  fact: '내 얘기를 들을 때 상대가 한숨을 쉬었다.',
  interpret: '"나는 같이 살기 피곤한 사람"이라고 단정했다.',
  emotions: '자책 70% · 서운함 50% · 위축감 40%',
  balanced: '"한숨은 사실이지만, 그게 내가 피곤한 사람이라는 증거는 아니다. 무슨 의미였는지는 아직 모른다."',
}

const RECOVERY = [
  { icon: 'fa-solid fa-wind',       label: '1분 호흡 정리',    color: 'var(--brand)' },
  { icon: 'fa-solid fa-water',      label: '생각 거리두기 5분', color: 'var(--like)'  },
  { icon: 'fa-solid fa-shield-halved', label: '나의 경계 점검하기', color: 'var(--warm-text)' },
]

const PHRASE_COLOR = {
  red:   '#E0654A',
  amber: '#E0A24A',
  gray:  'var(--ink-muted)',
}

const MOOD_COLOR = {
  neg: 'var(--like)',
  neu: 'color-mix(in srgb, var(--brand), var(--like) 40%)',
  pos: 'var(--brand)',
}

export default function Analysis({ nav, isDark, toggleTheme, nickname }) {
  const [period, setPeriod] = useState('월간')
  const [menuOpen, setMenuOpen] = useState(false)
  const r = REPORTS[period]
  const maxCount = Math.max(...r.phrases.map(p => p.count))
  const gaugePct = Math.min(100, (r.gaslight.score / 20) * 100)

  return (
    <div className="phone-body report-print">
      <div className="topbar">
        <p className="eyebrow">관계 마음 리포트</p>
        <div className="topbar__icons">
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          <div style={{ position: 'relative' }}>
            <i className="fa-solid fa-ellipsis" style={{ cursor: 'pointer' }} onClick={() => setMenuOpen(o => !o)}></i>
            {menuOpen && (
              <div className="kebab-menu">
                <div className="kebab-item" onClick={() => { setMenuOpen(false); exportReportPdf() }}>
                  <i className="fa-solid fa-file-arrow-down"></i> PDF로 내보내기
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 헤더 + 주간/월간 토글 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 23, margin: '0 0 5px' }}>관계 마음 리포트</h1>
          <p className="page-sub" style={{ fontSize: 13.5 }}>{r.range} · 닉네임 '{nickname || '들풀'}'</p>
        </div>
        <span className="rp-lock"><i className="fa-solid fa-lock"></i> 나만 보는 리포트</span>
      </div>

      <div className="seg" style={{ marginTop: 14 }}>
        {['주간', '월간'].map(p => (
          <div key={p} className={`seg-item${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>{p}</div>
        ))}
      </div>

      {/* ① 종합 */}
      <div className="rp-summary">
        <div className="rp-summary__label"><i className="fa-solid fa-wand-magic-sparkles"></i> 종합</div>
        <p className="rp-summary__text">{r.summary}</p>
        <p className="rp-disclaimer">이 리포트는 자기이해를 돕는 참고 자료이며, 의료적 진단이 아닙니다.</p>
      </div>

      {/* 주간: 요일별 마음 날씨 */}
      {period === '주간' && r.weekly && (
        <div className="card rp-card">
          <div className="rp-card__head"><span className="rp-card__title"><i className="fa-solid fa-cloud-sun"></i> 요일별 마음 날씨</span></div>
          <div className="bars" style={{ height: 110 }}>
            {r.weekly.map(b => (
              <div key={b.day} className="bar-col">
                <div className="bar" style={{ height: `${b.h}%`, background: MOOD_COLOR[b.mood] }}></div>
                <span className="bar-day">{b.day}</span>
              </div>
            ))}
          </div>
          <p className="rp-note">{r.weeklyNote}</p>
        </div>
      )}

      {/* 월간: 주차별 흐름 + 인사이트 */}
      {period === '월간' && r.weeks && (
        <div className="card rp-card">
          <div className="rp-card__head"><span className="rp-card__title"><i className="fa-solid fa-arrow-trend-up"></i> 주차별 긍정 감정 흐름</span></div>
          <div className="bars" style={{ height: 100 }}>
            {r.weeks.map(w => (
              <div key={w.label} className="bar-col">
                <div className="bar" style={{ height: `${w.pos * 2}%`, background: 'linear-gradient(180deg, #3FB984, color-mix(in srgb,#3FB984,var(--surface) 30%))' }}></div>
                <span className="bar-day">{w.label}</span>
              </div>
            ))}
          </div>
          <p className="rp-note">{r.trend}</p>
          <div className="insight" style={{ marginTop: 12 }}>
            <div className="il"><i className="fa-solid fa-seedling"></i>이번 달 새롭게 알게 된 나</div>
            <p>{r.insight}</p>
          </div>
        </div>
      )}

      {/* ② 가스라이팅 자가점검 */}
      <div className="card rp-card">
        <div className="rp-card__head">
          <span className="rp-card__title"><i className="fa-solid fa-clipboard-check"></i> 가스라이팅 자가점검</span>
          <span className="rp-pill">{r.gaslight.score}점 · {r.gaslight.level}</span>
        </div>
        <div className="gauge">
          <div className="gauge__bar" />
          <div className="gauge__marker" style={{ left: `${gaugePct}%` }} />
        </div>
        <div className="gauge__scale">
          <span>0-5 안정</span><span>6-12 주의</span><span>13-20 위험</span>
        </div>
        <p className="rp-note">
          내 기억·판단을 자주 의심하고, 갈등 후 "내가 예민한 걸까"로 마무리되는 경향이 보여요.
          자체 자가점검 문항 기반 · 검증된 임상척도 아님.
        </p>
      </div>

      {/* ③ 감정 분석 */}
      <div className="card rp-card">
        <div className="rp-card__head">
          <span className="rp-card__title"><i className="fa-solid fa-chart-pie"></i> 감정 분석</span>
        </div>
        <div className="emotion">
          <div
            className="donut"
            style={{ background: `conic-gradient(#E0654A 0 ${r.emotion.neg}%, #8E96A8 ${r.emotion.neg}% ${r.emotion.neg + r.emotion.neu}%, #3FB984 ${r.emotion.neg + r.emotion.neu}% 100%)` }}
          >
            <div className="donut__hole" />
          </div>
          <div className="emotion__legend">
            <div><span className="dot" style={{ background: '#E0654A' }} /> 부정 {r.emotion.neg}%</div>
            <div><span className="dot" style={{ background: '#8E96A8' }} /> 중립 {r.emotion.neu}%</div>
            <div><span className="dot" style={{ background: '#3FB984' }} /> 긍정 {r.emotion.pos}%</div>
          </div>
        </div>
        <p className="rp-subnote">자주 나타난 감정</p>
        <div className="chip-row">
          {r.emotion.tags.map(t => <span key={t} className="chip chip--sm">{t}</span>)}
        </div>
      </div>

      {/* ④ 반복되는 표현 */}
      <div className="card rp-card">
        <div className="rp-card__head">
          <span className="rp-card__title"><i className="fa-solid fa-rotate"></i> 반복되는 표현</span>
        </div>
        <div className="stack" style={{ gap: 14 }}>
          {r.phrases.map(p => (
            <div key={p.text} className="phrase">
              <span className="phrase__text">"{p.text}"</span>
              <div className="phrase__track">
                <div className="phrase__fill" style={{ width: `${(p.count / maxCount) * 100}%`, background: PHRASE_COLOR[p.tone] }} />
              </div>
              <span className="phrase__count">{p.count}회</span>
            </div>
          ))}
        </div>
      </div>

      {/* ⑤ 사실·해석·감정 나눠보기 */}
      <div className="card rp-split">
        <div className="rp-card__head">
          <span className="rp-card__title"><i className="fa-solid fa-shuffle"></i> 사실·해석·감정 나눠보기</span>
        </div>
        <p className="rp-subnote" style={{ marginTop: 0 }}>사이만의 정리 방식 — 같은 일을 세 갈래로 떼어 봅니다</p>
        <div className="rp-quote">"{SPLIT.quote}"</div>
        <div className="split-row"><span className="tag tag--fact">확인된 사실</span><span>{SPLIT.fact}</span></div>
        <div className="split-row"><span className="tag tag--interpret">내가 한 해석</span><span>{SPLIT.interpret}</span></div>
        <div className="split-row"><span className="tag tag--emotion">느낀 감정</span><span>{SPLIT.emotions}</span></div>
        <div className="split-divider" />
        <div className="split-row"><span className="tag tag--balance">균형 문장</span><span>{SPLIT.balanced}</span></div>
      </div>

      {/* ⑥ 오늘의 회복 제안 */}
      <div className="section-label"><i className="fa-solid fa-seedling"></i>오늘의 회복 제안</div>
      <div className="recovery-grid">
        {RECOVERY.map(a => (
          <button key={a.label} className="recovery-btn">
            <i className={a.icon} style={{ color: a.color }}></i>{a.label}
          </button>
        ))}
      </div>

      {/* ⑦ 상담기관 연결 */}
      <div style={{ marginTop: 16 }}><SafetyCard nav={nav} signal="우울 무기력 서운함" /></div>

      <BottomNav active="분석" nav={nav} />
    </div>
  )
}

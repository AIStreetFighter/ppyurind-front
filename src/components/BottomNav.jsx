const tabs = [
  { label: '홈',      icon: 'fa-solid fa-house',        screen: 'home'      },
  { label: '기록',    icon: 'fa-solid fa-pen',           screen: 'record'    },
  { label: '커뮤니티', icon: 'fa-solid fa-comment-dots', screen: 'community' },
  { label: '마이',    icon: 'fa-regular fa-user',        screen: 'mypage'    },
]

export default function BottomNav({ active, nav }) {
  return (
    <div className="bottom-nav">
      {tabs.map(t => (
        <div
          key={t.label}
          className={`tab${active === t.label ? ' active' : ''}`}
          onClick={() => nav(t.screen)}
        >
          <i className={t.icon}></i>
          {t.label}
        </div>
      ))}
    </div>
  )
}

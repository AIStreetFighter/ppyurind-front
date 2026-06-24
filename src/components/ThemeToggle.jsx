export default function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        border: '1px solid var(--surface-line)',
        background: 'var(--surface)',
        color: isDark ? '#F2C879' : '#7B6FE0',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        flexShrink: 0,
        transition: 'background 0.2s, color 0.2s',
      }}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
    </button>
  )
}

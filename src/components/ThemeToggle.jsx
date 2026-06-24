export default function ThemeToggle({ isDark, toggleTheme }) {
  return (
    <i
      className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}
      onClick={toggleTheme}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      style={{
        color: isDark ? '#F2C879' : '#7B6FE0',
        cursor: 'pointer',
        transition: 'color 0.2s',
      }}
    />
  )
}

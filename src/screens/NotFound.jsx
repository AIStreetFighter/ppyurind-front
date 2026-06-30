const spriteBtn = (onClick, label, xOffset) => (
  <div
    role="button"
    tabIndex={0}
    aria-label={label}
    onClick={onClick}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    style={{
      width: 148,
      height: 56,
      cursor: "pointer",
      borderRadius: 999,
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 296,
      height: 56,
      backgroundImage: "url(/assets/404_button.png)",
      backgroundSize: "296px 56px",
      backgroundPosition: `${xOffset}px 0`,
      backgroundRepeat: "no-repeat",
    }} />
  </div>
);

export default function NotFound({ nav }) {
  const handleBack = () => {
    if (window.history.length > 1) window.history.back();
    else nav("home");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      minHeight: "100vh",
      padding: "0 24px",
    }}>
      <img
        src="/assets/404_error.png"
        alt="404 길을 잃었어요"
        style={{ width: "100%", maxWidth: 320, marginBottom: 40 }}
      />

      <div style={{ display: "flex", gap: 16 }}>
        {spriteBtn(() => nav("home"), "홈으로 가기", 0)}
        {spriteBtn(handleBack, "이전으로", -148)}
      </div>
    </div>
  );
}

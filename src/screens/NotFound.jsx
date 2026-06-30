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
        src="/assets/404_error_web.png"
        alt="404 길을 잃었어요"
        style={{ width: "100%", maxWidth: 400, marginBottom: 36 }}
      />

      <div style={{ display: "flex", gap: 16 }}>
        <img
          src="/assets/404_home_button.png"
          alt="홈으로 가기"
          onClick={() => nav("home")}
          style={{ width: 148, cursor: "pointer" }}
        />
        <img
          src="/assets/404_back_button.png"
          alt="이전으로"
          onClick={handleBack}
          style={{ width: 148, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

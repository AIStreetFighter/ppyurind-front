export default function NotFound({ nav }) {
  const handleBack = () => {
    if (window.history.length > 1) window.history.back();
    else nav('home');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img
        src="/assets/404_bg.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 24px',
      }}>
        <img src="/assets/404_cats.png" alt="" style={{ width: '90%', maxWidth: 380, marginBottom: -48 }} />
        <img src="/assets/404_text.png" alt="404 앗, 길을 잃었어요" style={{ width: '100%', maxWidth: 480 }} />
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <img src="/assets/404_home_button.png" alt="홈으로 가기" onClick={() => nav('home')} style={{ width: 148, cursor: 'pointer' }} />
          <img src="/assets/404_back_button.png" alt="이전으로" onClick={handleBack} style={{ width: 148, cursor: 'pointer' }} />
        </div>
      </div>
    </div>
  );
}

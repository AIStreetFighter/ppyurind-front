import { useEffect, useState } from "react";
import "./Splash.css";

// 스플래시 화면 — 원본 쀼라인드_스플래시.html 디자인 그대로 구현
// 약 3.2s 후 onDone() 호출해 다음 화면으로 전환
export default function Splash({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true);
      // fade-out 0.4s 후 실제 전환
      setTimeout(onDone, 400);
    }, 5000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`splash-root${exiting ? " splash-exit" : ""}`}>
      <div className="splash-phone">
        <div className="splash-bg" />
        <div className="splash-glow splash-glow-moon" />
        <div className="splash-glow splash-glow-star" />
        <div className="splash-shooting-star" />
        <div className="splash-vignette" />

        <div className="splash-logo-wrap">
          <img
            className="splash-logo-img"
            src="/assets/splash-logo.png"
            alt="쀼라인드"
          />
        </div>

        <div className="splash-tagline">
          <p className="line1">우리 사이, 마음을 기록하다</p>
          <p className="line2">쀼라인드와 함께하는 관계 돌봄</p>
        </div>

        <div className="splash-loading">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

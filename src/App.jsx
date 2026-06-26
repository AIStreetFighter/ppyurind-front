import { useState } from "react";
import KakaoLogin from "./screens/KakaoLogin";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import Record from "./screens/Record";
import Analysis from "./screens/Analysis";
import AnalysisResult from "./screens/AnalysisResult";
import Translate from "./screens/Translate";
import Calendar from "./screens/Calendar";
import Report from "./screens/Report";
import Community from "./screens/Community";
import MyPage from "./screens/MyPage";

export default function App() {
  const [screen, setScreen] = useState("kakaoLogin");
  const [isDark, setIsDark] = useState(true);

  const nav = (to) => setScreen(to);
  const toggleTheme = () => setIsDark((prev) => !prev);

  const props = { nav, isDark, toggleTheme };

  const screens = {
    kakaoLogin: <KakaoLogin {...props} />,
    onboarding: <Onboarding {...props} />,
    home: <Home {...props} />,
    record: <Record {...props} />,
    analysis: <Analysis {...props} />,
    analysisResult: <AnalysisResult {...props} />,
    translate: <Translate {...props} />,
    calendar: <Calendar {...props} />,
    report: <Report {...props} />,
    community: <Community {...props} />,
    mypage: <MyPage {...props} />,
  };

  return (
    <div className={`phone${isDark ? "" : " is-light"}`}>{screens[screen]}</div>
  );
}

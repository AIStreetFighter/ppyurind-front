import { useState } from "react";
import KakaoLogin from "./screens/KakaoLogin";
import Onboarding from "./screens/Onboarding";
import Home from "./screens/Home";
import Record from "./screens/Record";
import Analysis from "./screens/Analysis";
import AnalysisResult from "./screens/AnalysisResult";
import Translate from "./screens/Translate";
import Calendar from "./screens/Calendar";
import MindCheckup from "./screens/MindCheckup";
import Legal from "./screens/Legal";
import PostDetail from "./screens/PostDetail";
import Report from "./screens/Report";
import Community from "./screens/Community";
import MyPage from "./screens/MyPage";

export default function App() {
  const [screen, setScreen] = useState("kakaoLogin");
  const [isDark, setIsDark] = useState(true);
  const [nickname, setNickname] = useState("지우");
  const [checkupSignal, setCheckupSignal] = useState("");
  const [legal, setLegal] = useState({ doc: "privacy", from: "kakaoLogin" });
  const [activePost, setActivePost] = useState(null);

  const nav = (to, payload) => {
    if (to === "checkup") setCheckupSignal(payload?.signal || "");
    if (to === "legal") setLegal({ doc: payload?.doc || "privacy", from: payload?.from || "kakaoLogin" });
    if (to === "post" && payload?.post) setActivePost(payload.post);
    setScreen(to);
  };
  const toggleTheme = () => setIsDark((prev) => !prev);

  const props = { nav, isDark, toggleTheme, nickname, onNicknameSave: setNickname };

  const screens = {
    kakaoLogin: <KakaoLogin {...props} />,
    onboarding: <Onboarding {...props} />,
    home: <Home {...props} />,
    record: <Record {...props} />,
    analysis: <Analysis {...props} />,
    analysisResult: <AnalysisResult {...props} />,
    translate: <Translate {...props} />,
    calendar: <Calendar {...props} />,
    checkup: <MindCheckup {...props} signal={checkupSignal} />,
    legal: <Legal {...props} doc={legal.doc} from={legal.from} />,
    post: <PostDetail {...props} post={activePost} />,
    report: <Report {...props} />,
    community: <Community {...props} />,
    mypage: <MyPage {...props} />,
  };

  return (
    <div className={`phone${isDark ? "" : " is-light"}`}>{screens[screen]}</div>
  );
}

import { useState } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
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
import NotFound from "./screens/NotFound";
import Chat from "./screens/Chat";

const SCREEN_PATHS = {
  kakaoLogin: "/",
  onboarding: "/onboarding",
  home: "/home",
  record: "/record",
  analysis: "/analysis",
  analysisResult: "/analysis/result",
  translate: "/translate",
  calendar: "/calendar",
  checkup: "/mind-checkup",
  legal: "/legal",
  post: "/community/post",
  report: "/report",
  community: "/community",
  mypage: "/mypage",
  chat: "/chat",
};

const PATH_SCREENS = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen])
);

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const screen = PATH_SCREENS[location.pathname] ?? "notFound";
  const [isDark, setIsDark] = useState(true);
  const [nickname, setNickname] = useState("지우");
  const [concerns, setConcerns] = useState(["대화 단절", "서운함"]);
  const [checkupSignal, setCheckupSignal] = useState("");
  const [legal, setLegal] = useState({ doc: "privacy", from: "kakaoLogin" });
  const [activePost, setActivePost] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const nav = (to, payload) => {
    if (to === "checkup") setCheckupSignal(payload?.signal || "");
    if (to === "legal") setLegal({ doc: payload?.doc || "privacy", from: payload?.from || "kakaoLogin" });
    if (to === "post" && payload?.post) setActivePost(payload.post);
    if (to === "analysisResult") setAnalysisResult(payload?.result || null);
    navigate(SCREEN_PATHS[to] || "/");
  };
  const toggleTheme = () => setIsDark((prev) => !prev);

  const props = { nav, isDark, toggleTheme, nickname, onNicknameSave: setNickname, concerns, onConcernsSave: setConcerns };

  const screens = {
    kakaoLogin: <KakaoLogin {...props} />,
    onboarding: <Onboarding {...props} />,
    home: <Home {...props} />,
    record: <Record {...props} />,
    analysis: <Analysis {...props} />,
    analysisResult: <AnalysisResult {...props} result={analysisResult} />,
    translate: <Translate {...props} />,
    calendar: <Calendar {...props} />,
    checkup: <MindCheckup {...props} signal={checkupSignal} />,
    legal: <Legal {...props} doc={legal.doc} from={legal.from} />,
    post: <PostDetail {...props} post={activePost} />,
    report: <Report {...props} />,
    community: <Community {...props} />,
    mypage: <MyPage {...props} />,
    chat: <Chat {...props} />,
    notFound: <NotFound {...props} />,
  };

  return (
    <div className={`phone${isDark ? "" : " is-light"}`}>{screens[screen]}</div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

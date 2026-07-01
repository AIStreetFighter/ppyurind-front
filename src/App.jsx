import { useState, useEffect } from "react";
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
import CommunityWrite from "./screens/CommunityWrite";
import MyPage from "./screens/MyPage";
import MyCommunityPosts from "./screens/MyCommunityPosts";
import NotFound from "./screens/NotFound";
import Chat from "./screens/Chat";
import EmailAuth from "./screens/EmailAuth";
import OAuthCallback from "./screens/OAuthCallback";

const SCREEN_PATHS = {
  kakaoLogin: "/",
  emailAuth: "/login/email",
  oauthCallback: "/auth/success",
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
  communityWrite: "/community/write",
  report: "/report",
  community: "/community",
  mypage: "/mypage",
  myPosts: "/mypage/community-posts",
  chat: "/chat",
};

const PATH_SCREENS = Object.fromEntries(
  Object.entries(SCREEN_PATHS).map(([screen, path]) => [path, screen])
);
// 백엔드 OAuth 성공 리다이렉트 경로(/auth/callback) 별칭 — /auth/success와 동일하게 콜백 처리
PATH_SCREENS["/auth/callback"] = "oauthCallback";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const screen = PATH_SCREENS[location.pathname] ?? "notFound";
  const [isDark, setIsDark] = useState(true);
  // 닉네임: 새로고침해도 유지되도록 localStorage에 저장된 마지막 값으로 초기화
  const [nickname, setNickname] = useState(() => localStorage.getItem("ppyurind:nickname") || "지우");
  const saveNickname = (name) => {
    if (!name) return;              // 빈 값으로 덮어써서 초기화되는 것 방지
    localStorage.setItem("ppyurind:nickname", name);
    setNickname(name);
  };
  const [concerns, setConcerns] = useState(["대화 단절", "서운함"]);
  const [checkupSignal, setCheckupSignal] = useState("");
  const [legal, setLegal] = useState({ doc: "privacy", from: "kakaoLogin" });
  const [activePost, setActivePost] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ppyurind:activePost') || 'null') } catch { return null }
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [translateInitialText, setTranslateInitialText] = useState('');

  // post 없이 /community/post 직접 접근 또는 새로고침 시 커뮤니티로 복귀
  useEffect(() => {
    if (screen === 'post' && !activePost) navigate(SCREEN_PATHS['community'])
  }, [screen, activePost])

  const nav = (to, payload) => {
    if (to === "checkup") setCheckupSignal(payload?.signal || "");
    if (to === "legal") setLegal({ doc: payload?.doc || "privacy", from: payload?.from || "kakaoLogin" });
    if (to === "post" && payload?.post) {
      setActivePost(payload.post);
      try { sessionStorage.setItem('ppyurind:activePost', JSON.stringify(payload.post)) } catch {}
    }
    if (to === "analysisResult") { setAnalysisResult(payload?.result || null); setTranslateInitialText(payload?.rawContent || ''); }
    if (to === "translate" && payload?.initialText) setTranslateInitialText(payload.initialText);
    navigate(SCREEN_PATHS[to] || "/");
  };
  const toggleTheme = () => setIsDark((prev) => !prev);

  const props = { nav, isDark, toggleTheme, nickname, onNicknameSave: saveNickname, concerns, onConcernsSave: setConcerns };

  const screens = {
    kakaoLogin: <KakaoLogin {...props} />,
    emailAuth: <EmailAuth nav={nav} />,
    oauthCallback: <OAuthCallback nav={nav} />,
    onboarding: <Onboarding {...props} />,
    home: <Home {...props} />,
    record: <Record {...props} />,
    analysis: <Analysis {...props} />,
    analysisResult: <AnalysisResult {...props} result={analysisResult} rawContent={translateInitialText} />,
    translate: <Translate {...props} initialText={translateInitialText} />,
    calendar: <Calendar {...props} />,
    checkup: <MindCheckup {...props} signal={checkupSignal} />,
    legal: <Legal {...props} doc={legal.doc} from={legal.from} />,
    post: <PostDetail {...props} post={activePost} />,
    communityWrite: <CommunityWrite {...props} />,
    report: <Report {...props} />,
    community: <Community {...props} />,
    mypage: <MyPage {...props} />,
    myPosts: <MyCommunityPosts {...props} />,
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

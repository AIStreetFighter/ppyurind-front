import { useState, useEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import Splash from "./screens/Splash";
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
import LockScreen from "./screens/LockScreen";
import FloatingChat from "./components/FloatingChat";
import { shouldLock } from "./utils/appLock";
import { getAccessToken } from "./api/client";
import { isDemo } from "./utils/demo";

// 전역 플로팅 챗봇 노출 화면. 홈은 말풍선 없이(noBubble), 커뮤니티는 글쓰기 FAB와 겹쳐 제외
const CHATBOT_SCREENS = new Set(["home", "record", "analysis", "calendar", "report", "mypage", "myPosts"]);

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
  // 닉네임: 새로고침해도 유지되도록 localStorage에 저장된 마지막 값으로 초기화.
  // 데모는 실제 유저 닉네임(ppyurind:nickname)을 물려받지 않도록 별도 키(demoNickname)를 사용 → 기본 '지우'.
  const nickKey = () => (isDemo() ? "ppyurind:demoNickname" : "ppyurind:nickname");
  const [nickname, setNickname] = useState(() => localStorage.getItem(nickKey()) || "지우");
  const saveNickname = (name) => {
    if (!name) return;              // 빈 값으로 덮어써서 초기화되는 것 방지
    localStorage.setItem(nickKey(), name);
    setNickname(name);
  };
  const [concerns, setConcerns] = useState(["대화 단절", "서운함"]);
  const [checkupSignal, setCheckupSignal] = useState("");
  const [analysisPeriod, setAnalysisPeriod] = useState("");
  const [legal, setLegal] = useState({ doc: "privacy", from: "kakaoLogin" });
  const [activePost, setActivePost] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ppyurind:activePost') || 'null') } catch { return null }
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisShared, setAnalysisShared] = useState(undefined);
  const [translateInitialText, setTranslateInitialText] = useState('');

  // 탭/화면 전환 시 이전 스크롤 위치가 남아 페이지 중간부터 보이는 문제 → 최상단으로 리셋
  // window 스크롤과 내부 스크롤 컨테이너(.phone-body/.pd-body/.sheet) 모두 초기화
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelectorAll('.phone-body, .pd-body, .sheet').forEach((el) => { el.scrollTop = 0; });
  }, [location.pathname])

  // 다크/라이트 모드에 맞춰 모바일 상단바(theme-color)도 변경 (라이트 모드에서 다크 상단바 어색함 방지)
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#1B2240' : '#FFFFFF');
  }, [isDark])

  // post 없이 /community/post 직접 접근 또는 새로고침 시 커뮤니티로 복귀
  useEffect(() => {
    if (screen === 'post' && !activePost) navigate(SCREEN_PATHS['community'])
  }, [screen, activePost])

  // 토큰 만료(401) 전역 처리 — 조용한 저장 실패 대신 재로그인으로 유도
  useEffect(() => {
    const onUnauthorized = () => {
      try { sessionStorage.setItem('ppyurind:sessionExpired', '1') } catch {}
      navigate(SCREEN_PATHS['kakaoLogin'])
    }
    window.addEventListener('ppyurind:unauthorized', onUnauthorized)
    return () => window.removeEventListener('ppyurind:unauthorized', onUnauthorized)
  }, [])

  const nav = (to, payload) => {
    // 데모 진입(둘러보기→온보딩): 이전 실제 로그인 닉네임이 남아있지 않도록 데모 닉네임('지우')으로 리셋
    if (to === "onboarding" && isDemo()) setNickname(localStorage.getItem("ppyurind:demoNickname") || "지우");
    if (to === "checkup") setCheckupSignal(payload?.signal || "");
    if (to === "analysis") setAnalysisPeriod(payload?.period || "");
    if (to === "legal") setLegal({ doc: payload?.doc || "privacy", from: payload?.from || "kakaoLogin" });
    if (to === "post" && payload?.post) {
      setActivePost(payload.post);
      try { sessionStorage.setItem('ppyurind:activePost', JSON.stringify(payload.post)) } catch {}
    }
    if (to === "analysisResult") { setAnalysisResult(payload?.result || null); setAnalysisShared(payload?.shared); setTranslateInitialText(payload?.rawContent || ''); }
    if (to === "translate" && payload?.initialText) setTranslateInitialText(payload.initialText);
    navigate(SCREEN_PATHS[to] || "/");
  };
  const toggleTheme = () => setIsDark((prev) => !prev);

  const props = { nav, isDark, toggleTheme, nickname, onNicknameSave: saveNickname, concerns, onConcernsSave: setConcerns };

  const screens = {
    kakaoLogin: <KakaoLogin {...props} />,
    emailAuth: <EmailAuth nav={nav} isDark={isDark} onNicknameSave={saveNickname} />,
    oauthCallback: <OAuthCallback nav={nav} />,
    onboarding: <Onboarding {...props} />,
    home: <Home {...props} />,
    record: <Record {...props} />,
    analysis: <Analysis {...props} initialPeriod={analysisPeriod} />,
    analysisResult: <AnalysisResult {...props} result={analysisResult} rawContent={translateInitialText} shared={analysisShared} />,
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

  // 앱 잠금: 로그인 상태 + 잠금 사용 + 이번 세션 미해제면 잠금화면 노출
  const [locked, setLocked] = useState(() => !!getAccessToken() && shouldLock());

  return (
    <div className={`phone${isDark ? "" : " is-light"}`}>
      {locked
        ? <LockScreen onUnlock={() => setLocked(false)} />
        : screens[screen]}
      {!locked && CHATBOT_SCREENS.has(screen) && <FloatingChat nav={nav} isDark={isDark} />}
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  if (showSplash) return <Splash onDone={() => setShowSplash(false)} />
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

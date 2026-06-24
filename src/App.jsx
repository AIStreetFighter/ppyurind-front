import { useState } from 'react'
import KakaoLogin from './screens/KakaoLogin'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Record from './screens/Record'
import Analysis from './screens/Analysis'
import Translate from './screens/Translate'
import Report from './screens/Report'
import Community from './screens/Community'
import MyPage from './screens/MyPage'

const LIGHT_SCREENS = ['community', 'mypage']

export default function App() {
  const [screen, setScreen] = useState('kakaoLogin')

  const nav = (to) => setScreen(to)

  const screens = {
    kakaoLogin: <KakaoLogin nav={nav} />,
    onboarding: <Onboarding nav={nav} />,
    home:       <Home nav={nav} />,
    record:     <Record nav={nav} />,
    analysis:   <Analysis nav={nav} />,
    translate:  <Translate nav={nav} />,
    report:     <Report nav={nav} />,
    community:  <Community nav={nav} />,
    mypage:     <MyPage nav={nav} />,
  }

  return (
    <div className={`phone${LIGHT_SCREENS.includes(screen) ? ' is-light' : ''}`}>
      {screens[screen]}
    </div>
  )
}

// 마음건강 자가점검 도구 데이터
// 주의: 진단 도구가 아니라 "도움이 필요할 수 있는 신호"를 확인하는 자가점검이다.
// AI 분석의 risk_reason 키워드에 따라 적합한 검사를 추천(B안: 신호 매칭).

// 0~3 척도 공통 보기 (PHQ-9 / GAD-7)
const FREQ_OPTIONS = [
  { label: '전혀 아니다', score: 0 },
  { label: '며칠 동안', score: 1 },
  { label: '일주일 이상', score: 2 },
  { label: '거의 매일', score: 3 },
]

export const CHECKUPS = {
  phq9: {
    id: 'phq9',
    name: 'PHQ-9 우울감 자가점검',
    short: '우울감',
    icon: 'fa-cloud-rain',
    desc: '최근 2주간 우울 관련 9가지 신호를 확인해요.',
    period: '지난 2주 동안',
    options: FREQ_OPTIONS,
    questions: [
      '일이나 여가 활동에 흥미나 즐거움을 거의 느끼지 못했다',
      '기분이 가라앉거나, 우울하거나, 희망이 없다고 느꼈다',
      '잠들기 어렵거나 자주 깼다, 또는 너무 많이 잤다',
      '피곤하다고 느끼거나 기운이 거의 없었다',
      '입맛이 없거나 반대로 과식을 했다',
      '내가 실패자처럼 느껴지거나, 나 자신·가족을 실망시켰다고 느꼈다',
      '신문을 읽거나 TV를 보는 것처럼 집중하는 일이 어려웠다',
      '남들이 알아챌 만큼 행동이나 말이 느려지거나, 반대로 안절부절못했다',
      '차라리 죽는 것이 낫겠다고 생각하거나 어떤 식으로든 자신을 해칠 생각을 했다',
    ],
    // 위험 문항: 9번(자해 생각)에 1점 이상이면 점수와 무관하게 긴급 안내 우선
    urgentQuestionIndex: 8,
    maxScore: 27,
    bands: [
      { min: 0,  max: 4,  level: '양호',   text: '지금은 우울 신호가 뚜렷하지 않아요. 그래도 마음이 무거운 날엔 기록을 남겨보세요.' },
      { min: 5,  max: 9,  level: '가벼운 신호', text: '가벼운 우울감이 느껴져요. 충분한 휴식과 함께 변화가 이어지는지 지켜봐 주세요.' },
      { min: 10, max: 14, level: '중간 신호', text: '도움이 필요할 수 있는 신호가 보여요. 전문 상담을 한 번 받아보길 권해요.' },
      { min: 15, max: 19, level: '뚜렷한 신호', text: '우울 신호가 뚜렷해요. 가까운 상담기관과 연결해보는 것을 권장해요.' },
      { min: 20, max: 27, level: '강한 신호', text: '혼자 감당하기 어려운 신호예요. 전문기관의 도움을 꼭 받아보세요.' },
    ],
  },

  gad7: {
    id: 'gad7',
    name: 'GAD-7 불안 자가점검',
    short: '불안',
    icon: 'fa-wind',
    desc: '최근 2주간 불안·걱정과 관련된 7가지 신호를 확인해요.',
    period: '지난 2주 동안',
    options: FREQ_OPTIONS,
    questions: [
      '초조하거나 불안하거나 조마조마하게 느꼈다',
      '걱정을 멈추거나 조절할 수 없었다',
      '여러 가지 일에 대해 걱정을 너무 많이 했다',
      '편하게 쉬기가 어려웠다',
      '너무 안절부절못해서 가만히 있기 힘들었다',
      '쉽게 짜증이 나거나 화가 났다',
      '무언가 끔찍한 일이 생길 것처럼 두려웠다',
    ],
    urgentQuestionIndex: -1,
    maxScore: 21,
    bands: [
      { min: 0,  max: 4,  level: '양호',   text: '불안 신호가 뚜렷하지 않아요. 지금의 안정감을 잘 지켜가요.' },
      { min: 5,  max: 9,  level: '가벼운 신호', text: '가벼운 불안이 느껴져요. 호흡·산책 등으로 긴장을 풀어보세요.' },
      { min: 10, max: 14, level: '중간 신호', text: '불안이 일상에 영향을 줄 수 있어요. 상담을 받아보길 권해요.' },
      { min: 15, max: 21, level: '강한 신호', text: '불안 신호가 강해요. 전문기관의 도움을 받아보는 것을 권장해요.' },
    ],
  },

  // 자살위험 간이 점검 (P4 기반 단순화) — 예/아니오, 위험 응답 시 즉시 긴급 안내
  p4: {
    id: 'p4',
    name: '마음 안전 점검',
    short: '안전 점검',
    icon: 'fa-shield-heart',
    desc: '지금 많이 힘든 순간을 위한 짧은 안전 확인이에요.',
    period: '요즘',
    yesno: true,
    options: [
      { label: '아니요', score: 0 },
      { label: '예', score: 1 },
    ],
    questions: [
      '요즘 차라리 사라지고 싶다는 생각이 든 적이 있다',
      '구체적으로 나를 해치는 방법을 떠올린 적이 있다',
      '그 생각을 실제로 행동에 옮길 것 같다고 느낀다',
    ],
    // 하나라도 '예'면 긴급 안내 우선
    urgentIfAnyYes: true,
    maxScore: 3,
    bands: [
      { min: 0, max: 0, level: '안심', text: '지금 당장의 위험 신호는 보이지 않아요. 그래도 힘들 땐 언제든 도움을 요청해도 괜찮아요.' },
      { min: 1, max: 3, level: '도움 필요', text: '지금은 마음 분석보다 안전이 먼저예요. 아래 긴급 연락처로 꼭 도움을 받아주세요.' },
    ],
  },
}

// AI 분석 risk_reason → 추천 검사 매칭 (B안)
// 키워드가 감지되면 해당 검사를 우선 추천한다.
export function recommendCheckups(signal = '') {
  const s = String(signal)
  const picks = []
  if (/우울|무기력|무력|가라앉|희망/.test(s)) picks.push('phq9')
  if (/불안|초조|걱정|두려/.test(s)) picks.push('gad7')
  if (/자해|죽|위험|극단/.test(s)) picks.unshift('p4') // 안전 점검은 최우선
  // 기본값: 우울 점검
  if (picks.length === 0) picks.push('phq9')
  return [...new Set(picks)]
}

export function scoreBand(checkup, total) {
  return checkup.bands.find(b => total >= b.min && total <= b.max) || checkup.bands[checkup.bands.length - 1]
}

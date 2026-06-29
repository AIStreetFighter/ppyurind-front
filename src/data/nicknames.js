// 커뮤니티 익명 표시용 랜덤 닉네임 (형용사 + 동물)
// 프로필/마이페이지에는 영향 없음 — 커뮤니티 렌더링 시에만 사용.
// 같은 글엔 항상 같은 닉네임이 나오도록 글 id를 시드로 결정적(deterministic) 매핑.

const ADJECTIVES = [
  '배부른', '춤추는', '졸린', '용감한', '수줍은', '느긋한', '엉뚱한', '다정한',
  '씩씩한', '구름같은', '바쁜', '포근한', '반짝이는', '조용한', '먹보', '산뜻한',
  '나른한', '몽글한', '소심한', '말랑한', '깜찍한', '의젓한', '울보', '느릿한',
]

const ANIMALS = [
  '토끼', '악어', '고양이', '판다', '수달', '여우', '햄스터', '두더지',
  '북극곰', '청설모', '펭귄', '고슴도치', '너구리', '알파카', '물범', '문어',
  '다람쥐', '왈라비', '코알라', '거북이', '병아리', '올빼미', '돌고래', '족제비',
]

// 문자열/숫자 id → 안정적인 해시
function hashSeed(seed) {
  const s = String(seed)
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0
  }
  return h
}

// 글 id를 받아 항상 동일한 "형용사 동물" 닉네임 반환
export function nickFromId(id) {
  const h = hashSeed(id)
  const adj = ADJECTIVES[h % ADJECTIVES.length]
  const ani = ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length]
  return `${adj} ${ani}`
}

// 새 글 작성 시 1회 발급용 (랜덤)
export function randomNick() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const ani = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  return `${adj} ${ani}`
}

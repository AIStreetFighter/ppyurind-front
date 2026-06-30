# Backend integration todo

이번 프론트 수정에서 백엔드 연동이 필요한 기능입니다. 현재 프론트에서는 데모 확인을 위해 `localStorage`로 먼저 동작합니다.

## 1. 나만의 도감 항목 추가

- 화면: `MyPage`
- 현재 프론트 동작: `ppyurind:dexItems` 로컬 저장
- 필요한 API
  - `GET /api/v1/secrets`
  - `POST /api/v1/secrets`
  - `PATCH /api/v1/secrets/{secret_id}`
  - `DELETE /api/v1/secrets/{secret_id}`
- 프론트에서 필요한 응답 필드
  - `id`
  - `category`
  - `content`
  - `created_at`
  - `updated_at`

## 2. 내가 쓴 커뮤니티 글

- 화면: `MyCommunityPosts`
- 현재 프론트 동작: 커뮤니티 작성 글을 `ppyurind:myCommunityPosts` 로컬 저장
- 필요한 API
  - `GET /api/v1/community/posts/me`
  - 또는 `GET /api/v1/community/posts?mine=true`
- 프론트에서 필요한 응답 필드
  - `id`
  - `title`
  - `content`
  - `ai_tags`
  - `anonymous_nickname`
  - `anonymous_avatar`
  - `empathy_count`
  - `comfort_count`
  - `comment_count`
  - `created_at`

## 3. 커뮤니티 글 작성 후 내 글 목록 반영

- 현재 프론트 동작: 작성 성공 시 로컬 목록에 prepend
- 백엔드 연결 시 흐름
  - `POST /api/v1/community/posts`
  - 성공 응답으로 생성된 게시글 객체 반환
  - `MyCommunityPosts`에서는 서버의 내 글 목록을 다시 조회

## 주의

- 실제 사용자 식별은 JWT 기반 인증 미들웨어에서 처리해야 합니다.
- 프론트는 사용자의 실제 이메일, OAuth provider id, DB id를 직접 저장하지 않는 방향이 안전합니다.

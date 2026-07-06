#!/bin/bash
set -e

# ── 설정 ──────────────────────────────────────────────────────────────────────
RESOURCE_GROUP="10ai-2nd-team1"
APP_NAME="10ai-2nd-team1-static"
SITE_URL="https://blue-coast-040dc640f.7.azurestaticapps.net"
FRONT_DIR="$(dirname "$0")/.."
DIST_DIR="$FRONT_DIR/dist"

# ── 1. 사전 확인 ───────────────────────────────────────────────────────────────
echo "▶ [1/4] az CLI 로그인 확인 중..."
if ! az account show > /dev/null 2>&1; then
  echo "❌ az CLI 로그인이 필요해요: az login"
  exit 1
fi
echo "✅ az 로그인 확인 완료"

# ── 2. 프론트 빌드 ─────────────────────────────────────────────────────────────
echo ""
echo "▶ [2/4] 프론트 빌드 중 (npm run build)..."
cd "$FRONT_DIR"
npm run build
echo "✅ 빌드 완료: $DIST_DIR"

# ── 3. 배포 토큰 조회 후 SWA CLI로 배포 ────────────────────────────────────────
echo ""
echo "▶ [3/4] Azure Static Web Apps로 배포 중..."

DEPLOY_TOKEN=$(az staticwebapp secrets list \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.apiKey" \
  -o tsv)

if [ -z "$DEPLOY_TOKEN" ]; then
  echo "❌ 배포 토큰을 가져오지 못했어요."
  exit 1
fi

npx --yes @azure/static-web-apps-cli deploy "$DIST_DIR" \
  --deployment-token "$DEPLOY_TOKEN" \
  --env production

unset DEPLOY_TOKEN
echo "✅ 배포 완료"

# ── 4. 배포 확인 ───────────────────────────────────────────────────────────────
echo ""
echo "▶ [4/4] 배포 확인 중..."

MAX_RETRY=10
COUNT=0
while [ $COUNT -lt $MAX_RETRY ]; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null || true)
  if [ "$STATUS" = "200" ]; then
    echo ""
    echo "🎉 배포 완료! $SITE_URL (HTTP $STATUS)"
    break
  fi
  COUNT=$((COUNT + 1))
  echo "  대기 중... ($COUNT/$MAX_RETRY, 마지막 응답: $STATUS)"
  sleep 5
done

if [ "$STATUS" != "200" ]; then
  echo "⚠️  배포 후 확인이 타임아웃됐어요. 직접 확인해주세요: $SITE_URL"
fi

// 리포트 PDF 내보내기 — 브라우저 인쇄(window.print) 방식
// 인쇄 대화상자에서 'PDF로 저장'을 선택하면 벡터 텍스트·차트가 선명하게 저장됨.
// 인쇄 대상은 .report-print 가 붙은 화면만 남기고 나머지 UI는 @media print 에서 숨김(CSS).

export function exportReportPdf() {
  window.print()
}

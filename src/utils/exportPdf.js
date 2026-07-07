// 리포트 PDF 내보내기 — 화면을 캡처해 PDF 파일로 직접 생성 후 다운로드
// window.print() 방식은 홈 화면에 설치된 PWA(standalone 모드)에서 인쇄 시트가 뜨지 않아
// 아무 반응이 없는 문제가 있어, html2canvas + jsPDF로 자체 PDF 파일을 만들어 저장한다.
// 캡처 대상은 .report-print 가 붙은 화면이며, .no-print 등 인쇄 제외 요소는 캡처 시 숨긴다.

const HIDE_SELECTOR = '.no-print, .bottom-nav, .topbar__icons, .safety, .backbar-inline i'

export async function exportReportPdf() {
  const target = document.querySelector('.report-print')
  if (!target) return

  try {
    const [{ toCanvas }, { jsPDF }] = await Promise.all([
      import('html-to-image'),
      import('jspdf'),
    ])

    const canvas = await toCanvas(target, {
      pixelRatio: Math.min(2, window.devicePixelRatio || 1),
      backgroundColor: getComputedStyle(document.body).backgroundColor || '#ffffff',
      filter: (el) => !(el.matches?.(HIDE_SELECTOR)),
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgHeight = (canvas.height * pageWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    pdf.save(`ppyurind_리포트_${date}.pdf`)
  } catch (err) {
    console.error('PDF export failed', err)
    alert('PDF 저장에 실패했어요. 잠시 후 다시 시도해주세요.')
  }
}

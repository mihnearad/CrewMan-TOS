import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportPdfOptions {
  filename: string
}

export async function exportPdf(element: HTMLElement, { filename }: ExportPdfOptions) {
  element.setAttribute('data-export-pdf-root', 'true')

  const sourceElements = Array.from(element.querySelectorAll<HTMLElement>('*'))
  const elementMap = new Map<string, HTMLElement>()

  sourceElements.forEach((node, index) => {
    const id = `pdf-${index}`
    node.setAttribute('data-export-pdf-id', id)
    elementMap.set(id, node)
  })

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    foreignObjectRendering: true,
    onclone: (documentClone) => {
      const root = documentClone.querySelector('[data-export-pdf-root="true"]')
      if (!root) return

      documentClone.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => node.remove())

      const cloneElements = root.querySelectorAll<HTMLElement>('[data-export-pdf-id]')
      cloneElements.forEach(node => {
        const id = node.getAttribute('data-export-pdf-id')
        if (!id) return

        const source = elementMap.get(id)
        if (!source) return

        const computed = window.getComputedStyle(source)
        for (let i = 0; i < computed.length; i += 1) {
          const prop = computed[i]
          node.style.setProperty(prop, computed.getPropertyValue(prop), computed.getPropertyPriority(prop))
        }
      })
    }
  })

  element.removeAttribute('data-export-pdf-root')
  sourceElements.forEach(node => node.removeAttribute('data-export-pdf-id'))

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: 'a4'
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth
  const imgHeight = (canvas.height * pageWidth) / canvas.width

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
  } else {
    let remainingHeight = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    remainingHeight -= pageHeight

    while (remainingHeight > 0) {
      pdf.addPage()
      position = -(imgHeight - remainingHeight)
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      remainingHeight -= pageHeight
    }
  }

  pdf.save(filename)
}

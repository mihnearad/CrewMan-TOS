export async function exportPdf(element: HTMLElement) {
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  iframe.style.left = '-9999px'
  document.body.appendChild(iframe)
  
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    return
  }

  // Helper to extract safe styles
  const getElementStyles = (el: HTMLElement) => {
    const computed = window.getComputedStyle(el)
    const importantStyles = [
      'display', 'position', 'width', 'height', 'min-width', 'min-height',
      'max-width', 'max-height', 'padding', 'margin', 'border', 'border-radius',
      'background', 'background-color', 'color', 'font-family', 'font-size',
      'font-weight', 'text-align', 'line-height', 'overflow', 'flex',
      'flex-direction', 'flex-wrap', 'flex-shrink', 'flex-grow', 'align-items',
      'justify-content', 'gap', 'left', 'right', 'top', 'bottom', 'transform',
      'opacity', 'visibility', 'white-space', 'text-overflow', 'letter-spacing',
      'text-transform', 'box-shadow'
    ]
    return importantStyles
      .map(prop => {
        const value = computed.getPropertyValue(prop)
        // Skip lab/oklab/oklch colors
        if (value && (value.includes('lab(') || value.includes('oklab(') || value.includes('oklch('))) {
          if (prop.includes('background')) return `${prop}: #ffffff`
          if (prop.includes('color') || prop.includes('border')) return `${prop}: #111827`
          return ''
        }
        return value ? `${prop}: ${value}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }

  // Build a map of computed styles for all elements before cloning
  const styleMap = new Map<number, string>()
  
  // Include the root element itself
  const rootStyle = getElementStyles(element)
  styleMap.set(-1, rootStyle)
  element.setAttribute('data-print-index', '-1')
  
  const allElements = element.querySelectorAll('*')
  allElements.forEach((el, index) => {
    if (el instanceof HTMLElement) {
      const styleStr = getElementStyles(el)
      styleMap.set(index, styleStr)
      el.setAttribute('data-print-index', String(index))
    }
  })
  
  // Clone the element
  const clone = element.cloneNode(true) as HTMLElement
  
  // Apply computed styles to cloned root element
  const rootStyleStr = styleMap.get(-1)
  if (rootStyleStr) {
    clone.setAttribute('style', rootStyleStr)
  }
  clone.removeAttribute('data-print-index')
  
  // Apply computed styles to cloned child elements
  clone.querySelectorAll('[data-print-index]').forEach(el => {
    const index = parseInt(el.getAttribute('data-print-index') || '-1', 10)
    const style = styleMap.get(index)
    if (style && el instanceof HTMLElement) {
      el.setAttribute('style', style)
    }
    el.removeAttribute('data-print-index')
  })
  
  // Clean up original elements
  element.removeAttribute('data-print-index')
  allElements.forEach(el => el.removeAttribute('data-print-index'))
  
  // Remove buttons and interactive elements from clone
  clone.querySelectorAll('button, [role="dialog"]').forEach(el => el.remove())
  
  // Remove elements with print:hidden class
  clone.querySelectorAll('[class*="print:hidden"]').forEach(el => el.remove())
  
  // Build the print document
  iframeDoc.open()
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Planning Report</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: white !important;
            color: #111827;
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `)
  iframeDoc.close()
  
  // Wait for iframe to render
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Print the iframe
  iframe.contentWindow?.print()
  
  // Clean up after a delay
  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 1000)
}

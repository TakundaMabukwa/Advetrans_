export function downloadCSVFromTable({ headers, rows, filename }) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    console.warn('Missing or invalid headers/rows for CSV export.')
    return
  }

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map((v) => `"${v ?? ''}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

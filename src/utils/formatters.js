export function formatCNPJ(v) {
  if (!v) return ''
  const d = v.replace(/\D/g, '')
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return v
}

export function formatCPF(v) {
  if (!v) return ''
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  return v
}

export function formatCPFCNPJ(v) {
  if (!v) return ''
  const d = v.replace(/\D/g, '')
  if (d.length === 11) return formatCPF(d)
  if (d.length === 14) return formatCNPJ(d)
  return v
}

export function formatCurrency(v) {
  const n = parseFloat(v) || 0
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(v) {
  if (!v) return ''
  // Handles ISO date strings like "2024-01-15T00:00:00" or "2024-01-15"
  const d = new Date(v)
  if (isNaN(d)) return v
  return d.toLocaleDateString('pt-BR')
}

export async function fetchCNPJ(cnpj) {
  const clean = cnpj.replace(/\D/g, '')
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`)
  if (!res.ok) return null
  const data = await res.json()
  return {
    nome: data.razao_social || data.nome_fantasia || '',
    cnpj: clean,
  }
}

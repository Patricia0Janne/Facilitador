const BASE_URL = 'https://api.nfe.io/v1'

export async function fetchNotaByChave(chave, apiKey, organizationId) {
  if (!apiKey || !organizationId) {
    throw new Error('API Key e Organization ID são necessários. Configure nas Configurações.')
  }
  const cleanChave = chave.replace(/\D/g, '')
  const response = await fetch(
    `${BASE_URL}/organizations/${organizationId}/nfe/${cleanChave}`,
    { headers: { Authorization: `Basic ${btoa(apiKey + ':')}` } }
  )
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `Erro ${response.status} ao consultar NFe.io`)
  }
  const data = await response.json()
  const nfe = data.nfe || data
  return {
    numero: nfe.number || nfe.numero || '',
    chaveAcesso: cleanChave,
    dataEmissao: nfe.issuedOn || nfe.dataEmissao || '',
    emitente: {
      nome: nfe.issuer?.name || nfe.emitente?.nome || '',
      cnpj: nfe.issuer?.federalTaxNumber || nfe.emitente?.cnpj || '',
    },
    destinatario: {
      nome: nfe.recipient?.name || nfe.destinatario?.nome || '',
      cpfCnpj: nfe.recipient?.federalTaxNumber || nfe.destinatario?.cpfCnpj || '',
    },
    itens: (nfe.items || nfe.itens || []).map(item => ({
      descricao: item.description || item.descricao || '',
      quantidade: parseFloat(item.quantity || item.quantidade || 0),
      valorUnitario: parseFloat(item.unitPrice || item.valorUnitario || 0),
      valorTotal: parseFloat(item.amount || item.valorTotal || 0),
    })),
    totais: {
      valorProdutos: parseFloat(nfe.grossTotal || nfe.totais?.valorProdutos || 0),
      valorNota: parseFloat(nfe.total || nfe.totais?.valorNota || 0),
    },
  }
}

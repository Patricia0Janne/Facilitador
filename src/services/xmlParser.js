import { parseStringPromise } from 'xml2js'

// Normaliza para array (com explicitArray:true tudo já é array, mas garante)
function arr(v) {
  if (v === undefined || v === null) return []
  return Array.isArray(v) ? v : [v]
}

// Retorna o primeiro valor não-undefined de obj[key] (suportando array ou valor direto)
function getVal(obj, ...keys) {
  for (const key of keys) {
    const v = obj?.[key]
    if (v === undefined || v === null) continue
    const first = Array.isArray(v) ? v[0] : v
    if (first !== undefined && first !== null && first !== '') return first
  }
  return ''
}

// Busca recursiva por uma chave em qualquer nível do objeto parseado
function findDeep(obj, targetKey, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 10) return null
  for (const key of Object.keys(obj)) {
    if (key === targetKey) {
      const v = obj[key]
      return Array.isArray(v) ? v[0] : v
    }
    const child = Array.isArray(obj[key]) ? obj[key][0] : obj[key]
    const found = findDeep(child, targetKey, depth + 1)
    if (found) return found
  }
  return null
}

export async function parseXML(text) {
  const result = await parseStringPromise(text, {
    explicitArray: true,
    ignoreAttrs: false,
    tagNameProcessors: [],
  })

  console.log('[xmlParser] Chaves raiz:', Object.keys(result))

  // Busca infNFe em qualquer nível — funciona com nfeProc, NFe, ou variações de namespace
  const infNFe = findDeep(result, 'infNFe')

  if (!infNFe) {
    console.error('[xmlParser] Estrutura completa:', JSON.stringify(result, null, 2).substring(0, 1000))
    throw new Error('XML inválido: elemento infNFe não encontrado. Verifique se é um XML NF-e válido.')
  }

  console.log('[xmlParser] infNFe encontrado, chaves:', Object.keys(infNFe))

  const ide   = arr(infNFe.ide)[0]   || {}
  const emit  = arr(infNFe.emit)[0]  || {}
  const dest  = arr(infNFe.dest)[0]  || {}
  const det   = arr(infNFe.det)
  const total = arr(arr(infNFe.total)[0]?.ICMSTot)[0] || {}

  // Chave de acesso: atributo Id do infNFe (sem prefixo "NFe") ou de protNFe
  const chaveAcesso =
    (infNFe?.['$']?.Id || '').replace(/^NFe/, '') ||
    findDeep(result, 'chNFe') ||
    ''

  const itens = det.map(d => {
    const prod = arr(d?.prod)[0] || {}
    return {
      descricao:     getVal(prod, 'xProd'),
      quantidade:    parseFloat(getVal(prod, 'qCom', 'qTrib') || '0'),
      valorUnitario: parseFloat(getVal(prod, 'vUnCom', 'vUnTrib') || '0'),
      valorTotal:    parseFloat(getVal(prod, 'vProd') || '0'),
    }
  })

  const parsed = {
    numero:       getVal(ide, 'nNF'),
    chaveAcesso,
    dataEmissao:  getVal(ide, 'dhEmi', 'dEmi'),
    emitente: {
      nome: getVal(emit, 'xNome'),
      cnpj: getVal(emit, 'CNPJ'),
    },
    destinatario: {
      nome:     getVal(dest, 'xNome'),
      cpfCnpj:  getVal(dest, 'CNPJ', 'CPF'),
    },
    itens,
    totais: {
      valorProdutos: parseFloat(getVal(total, 'vProd') || '0'),
      valorNota:     parseFloat(getVal(total, 'vNF')   || '0'),
    },
  }

  console.log('[xmlParser] Resultado:', parsed)
  return parsed
}

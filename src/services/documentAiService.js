/**
 * Google Document AI — Form Parser
 *
 * Como configurar:
 * 1. Acesse console.cloud.google.com → Document AI → Criar Processador → Form Parser
 * 2. Anote: Project ID, Location (us ou eu), Processor ID
 * 3. APIs & Services → Credentials → Criar API Key (restrinja ao Document AI API)
 * 4. Cole tudo nas Configurações do app
 */

const BASE_URL = (location) => `https://${location}-documentai.googleapis.com/v1`

// Extrai texto de um textAnchor usando o texto completo do documento
function textFromAnchor(fullText, anchor) {
  if (!anchor?.textSegments?.length) return ''
  return anchor.textSegments
    .map(seg => fullText.slice(parseInt(seg.startIndex || 0), parseInt(seg.endIndex || 0)))
    .join('')
    .trim()
}

// Converte valor monetário BR "1.234,56" → número
function parseMoney(s) {
  if (!s) return 0
  const clean = s.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

// Limpa número de NF: "000.001" → "1"
function cleanNFNumber(s) {
  return s.replace(/\./g, '').replace(/^0+/, '') || s
}

// Checa se uma string é CNPJ válido (14 dígitos)
function isCNPJ(s) {
  return /^\d{14}$/.test(s.replace(/\D/g, ''))
}

// Checa se uma string é CPF válido (11 dígitos)
function isCPF(s) {
  return /^\d{11}$/.test(s.replace(/\D/g, ''))
}

/**
 * Envia PDF para Document AI e retorna o documento processado.
 */
export async function callDocumentAI(arrayBuffer) {
  const cfg = getDocAIConfig()
  if (!cfg.token || !cfg.projectId || !cfg.processorId) {
    throw new Error(
      'Google Document AI não configurado. Acesse Configurações e preencha Project ID, Processor ID e Access Token.'
    )
  }

  // Converte ArrayBuffer → base64
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  // Processa em chunks para evitar stack overflow em PDFs grandes
  const CHUNK = 8192
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  const base64Content = btoa(binary)

  const url =
    `${BASE_URL(cfg.location)}/projects/${cfg.projectId}/locations/${cfg.location}/processors/${cfg.processorId}:process`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cfg.token}`,
    },
    body: JSON.stringify({
      rawDocument: { content: base64Content, mimeType: 'application/pdf' },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      err.error?.message ||
      `Document AI: erro ${res.status}. Verifique Project ID, Processor ID e API Key.`
    )
  }

  const data = await res.json()
  return data.document
}

/**
 * Mapeia o documento retornado pelo Document AI para o objeto notaFiscal.
 */
export function mapDocumentToNota(document) {
  const fullText = document.text || ''

  console.log('[documentAI] Texto completo extraído:\n', fullText.substring(0, 2000))

  // ── 1. Form Fields (key-value pairs do Form Parser) ──────────────────────
  const fields = {} // chave normalizada → valor
  for (const page of document.pages || []) {
    for (const ff of page.formFields || []) {
      const key   = textFromAnchor(fullText, ff.fieldName?.textAnchor)
                      .toLowerCase()
                      .replace(/[:\s]+$/g, '')
                      .trim()
      const value = textFromAnchor(fullText, ff.fieldValue?.textAnchor)
      if (key && value) {
        fields[key] = value
        // Guarda também sem acentos/caracteres especiais
        const keySimple = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim()
        if (keySimple !== key) fields[keySimple] = value
      }
    }
  }

  console.log('[documentAI] Form fields:', fields)

  // ── 2. Tabelas (itens da NF) ──────────────────────────────────────────────
  const itens = []
  for (const page of document.pages || []) {
    for (const table of page.tables || []) {
      // Identifica colunas pelo cabeçalho
      const headers = (table.headerRows?.[0]?.cells || []).map(c =>
        textFromAnchor(fullText, c.layout?.textAnchor).toLowerCase()
      )

      // Preferência por coluna de total mais específica ("v.total", "vl.total")
      // para não colidir com "b.c. icms", "valor icms", etc.
      const colDescricao  = headers.findIndex(h => /descri|produto|xprod/i.test(h))
      const colQtd        = headers.findIndex(h => /qtd|quant/i.test(h))
      const colValorUnit  = headers.findIndex(h => /unit|v\.?\s*unit/i.test(h))
      const colValorTotal = (() => {
        const specific = headers.findIndex(h => /v\.?\s*total|vl\.?\s*total/i.test(h))
        return specific >= 0 ? specific : headers.findIndex(h => /total/i.test(h))
      })()

      for (const row of table.bodyRows || []) {
        const cells = (row.cells || []).map(c =>
          textFromAnchor(fullText, c.layout?.textAnchor)
        )
        if (cells.length === 0) continue

        const descricao     = colDescricao  >= 0 ? cells[colDescricao]  : cells[0] || ''
        const quantidade    = parseMoney(colQtd       >= 0 ? cells[colQtd]       : '')
        const valorUnitario = parseMoney(colValorUnit >= 0 ? cells[colValorUnit] : '')
        const valorTotal    = parseMoney(colValorTotal >= 0 ? cells[colValorTotal] : cells[cells.length - 1])

        if (descricao && !/^[\d.,\s]+$/.test(descricao) && valorTotal > 0) {
          itens.push({ descricao: descricao.trim(), quantidade, valorUnitario, valorTotal })
        }
      }
    }
  }

  // Fallback: Form Parser às vezes não detecta tabelas no DANFE —
  // tenta extrair itens do texto completo via padrão de linha
  if (itens.length === 0) {
    const lineRe = /^(.{5,80}?)\s{2,}([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)\s*$/gm
    for (const m of fullText.matchAll(lineRe)) {
      const total = parseMoney(m[4])
      if (total > 0 && /[A-ZÁÉÍÓÚÃÕÇÂÊÎ]/.test(m[1])) {
        itens.push({
          descricao:     m[1].trim(),
          quantidade:    parseMoney(m[2]),
          valorUnitario: parseMoney(m[3]),
          valorTotal:    total,
        })
        if (itens.length >= 100) break
      }
    }
    if (itens.length > 0) console.log('[documentAI] Itens extraídos via fallback texto:', itens.length)
  }

  // ── 3. Entities (se usar Custom Document Extractor ou Specialized Processor) ──
  const entities = {}
  for (const entity of document.entities || []) {
    const type = entity.type?.toLowerCase() || ''
    const value = entity.mentionText?.trim() || ''
    if (type && value) entities[type] = value
  }

  console.log('[documentAI] Entities:', entities)

  // ── 4. Mapear campos → notaFiscal ─────────────────────────────────────────

  // Helpers de busca nos fields
  function findField(...patterns) {
    for (const p of patterns) {
      for (const [k, v] of Object.entries(fields)) {
        if (new RegExp(p, 'i').test(k)) return v
      }
    }
    return ''
  }

  // Trunka nome antes de campos de endereço/doc que podem vir na mesma string
  function cleanName(s) {
    if (!s) return ''
    return s
      .split(/\s{2,}|\b(?:CNPJ|CPF|INSC|FONE|TEL|CEP|RUA\s|AV\.\s|LOGRADOURO|ENDERE[CÇ]O)\b/i)[0]
      .trim()
  }

  // Número da NF
  const numero = cleanNFNumber(
    entities['numero_nota'] ||
    entities['nf_number'] ||
    findField('n[°oºú]', 'numero', 'number', 'nf.?e') ||
    ''
  )

  // Data de emissão
  const dataEmissao =
    entities['data_emissao'] ||
    entities['issue_date'] ||
    findField('emiss[aã]o', 'data.*emiss', 'issue.?date') ||
    ''

  // Chave de acesso (44 dígitos) — busca no texto completo
  let chaveAcesso = entities['chave_acesso'] || entities['access_key'] || ''
  if (!chaveAcesso) {
    const chaveMatch = fullText.match(/(\d[\d\s]{50,65}\d)/)
    if (chaveMatch) {
      const digits = chaveMatch[1].replace(/\s/g, '')
      if (digits.length === 44) chaveAcesso = digits
    }
  }
  if (!chaveAcesso) {
    const m = fullText.match(/\b(\d{44})\b/)
    if (m) chaveAcesso = m[1]
  }

  // CNPJs/CPFs encontrados no documento inteiro
  // Exige a "/" obrigatória do formato CNPJ — evita falso-positivo com nº de protocolo
  const cnpjList = [...fullText.matchAll(/\d{2}\.?\d{3}\.?\d{3}\/\d{4}-?\d{2}/g)]
    .map(m => m[0].replace(/\D/g, '')).filter(isCNPJ)
  const cpfList = [...fullText.matchAll(/\d{3}[\s.]?\d{3}[\s.]?\d{3}[\s-]?\d{2}/g)]
    .map(m => m[0].replace(/\D/g, '')).filter(isCPF)

  // Emitente
  const emitenteNome = cleanName(
    entities['emitente_nome'] ||
    entities['issuer_name'] ||
    findField('emitente.*nome', 'nome.*emitente', 'raz[aã]o.*social.*emit') ||
    ''
  )

  const emitenteCnpj =
    (entities['emitente_cnpj'] || findField('cnpj.*emit', 'emit.*cnpj') || cnpjList[0] || '').replace(/\D/g, '')

  // Destinatário
  const destinatarioNome = cleanName(
    entities['destinatario_nome'] ||
    entities['recipient_name'] ||
    findField('destinat.*nome', 'nome.*destinat', 'nome.*raz[aã]o') ||
    ''
  )

  const destinatarioCpfCnpj =
    (entities['destinatario_cpf'] || entities['destinatario_cnpj'] ||
     findField('cnpj.*dest', 'dest.*cnpj', 'cpf.*dest', 'dest.*cpf') ||
     cnpjList[1] || cpfList[0] || '').replace(/\D/g, '')

  // Helper: extrai valor monetário após um label no texto completo
  function findInText(...patterns) {
    for (const p of patterns) {
      const m = fullText.match(new RegExp(p + '[^\\n]{0,60}?(\\d[\\d.,]+)', 'i'))
      if (m?.[1]) return m[1]
    }
    return ''
  }

  // Totais
  const valorProdutos = parseMoney(
    entities['valor_produtos'] ||
    findField('total.*produto', 'valor.*produto', 'v\\.?prod') ||
    findInText(
      'total\\s+dos\\s+produtos',
      'valor\\s+dos\\s+produtos',
      'total\\s+de\\s+produtos',
      'v\\.?\\s*prod',
    )
  )

  const valorNota = parseMoney(
    entities['valor_total'] ||
    findField('valor.*total.*nf', 'total.*nota', 'valor.*total.*nota', 'valor.*nf-?e') ||
    findInText(
      'valor\\s+total\\s+da\\s+nf-?e',
      'valor\\s+total\\s+da\\s+nota',
      'total\\s+da\\s+nota',
    )
  )

  const nota = {
    numero,
    chaveAcesso,
    dataEmissao,
    emitente:     { nome: emitenteNome,        cnpj: emitenteCnpj },
    destinatario: { nome: destinatarioNome,    cpfCnpj: destinatarioCpfCnpj },
    itens,
    totais: { valorProdutos, valorNota },
  }

  console.log('[documentAI] Nota mapeada:', nota)
  return nota
}

// ── Config helpers ─────────────────────────────────────────────────────────

export function getDocAIConfig() {
  return {
    token:       localStorage.getItem('docai_token')       || '',
    projectId:   localStorage.getItem('docai_projectid')   || '',
    processorId: localStorage.getItem('docai_processorid') || '',
    location:    localStorage.getItem('docai_location')    || 'us',
  }
}

export function isDocAIConfigured() {
  const cfg = getDocAIConfig()
  return !!(cfg.token && cfg.projectId && cfg.processorId)
}

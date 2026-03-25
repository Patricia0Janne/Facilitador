import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { callDocumentAI, mapDocumentToNota, isDocAIConfigured } from './documentAiService'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// Tenta cada pattern e retorna o primeiro match (grupo 1)
function tryMatch(text, ...patterns) {
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1].trim()
  }
  return ''
}

// Pega o texto logo após um label e para antes de campos de endereço/doc
function afterLabel(text, ...labels) {
  for (const label of labels) {
    const re = new RegExp(label + '[:\\s/]*([^\\n\\r]{2,80})', 'i')
    const m = text.match(re)
    if (m?.[1]) {
      // Para no início de campos conhecidos que não fazem parte do nome
      const val = m[1]
        .split(/\s{2,}|\b(?:CNPJ|CPF|INSC|FONE|TEL|CEP|RUA\s|AV\.\s|LOGRADOURO|ENDERE[CÇ]O)\b/i)[0]
        .trim()
      if (val.length > 1) return val
    }
  }
  return ''
}

// Limpa número formatado: "000.001" → "1", "000.001.234" → "1234"
function cleanNumber(s) {
  return s.replace(/\./g, '').replace(/^0+/, '') || '0'
}

// Converte valor monetário "1.234,56" → número
function parseMoney(s) {
  if (!s) return 0
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
}

export async function parsePDF(arrayBuffer) {
  // Usa Google Document AI se configurado; fallback para extração local por regex
  if (isDocAIConfigured()) {
    console.log('[pdfParser] Usando Google Document AI')
    const document = await callDocumentAI(arrayBuffer)
    return mapDocumentToNota(document)
  }

  console.log('[pdfParser] Document AI não configurado — usando extração local')
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  // Extrai todos os itens de texto com posição (x, y)
  let items = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    for (const item of content.items) {
      if (!item.str?.trim()) continue
      items.push({
        str: item.str,
        x: Math.round(item.transform[4]),
        y: Math.round(item.transform[5]),
        page: p,
      })
    }
  }

  // Ordena: página → Y decrescente (topo da página = Y maior no PDF) → X crescente
  items.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page
    if (Math.abs(a.y - b.y) > 4) return b.y - a.y
    return a.x - b.x
  })

  const fullText = items.map(i => i.str).join(' ')

  console.log('[pdfParser] Texto extraído (primeiros 2000):\n', fullText.substring(0, 2000))

  // Agrupa elementos por linha (Y ± 4px) e ordena por X — usado em totais e itens
  const rows = []
  for (const item of items) {
    const row = rows.find(r => r.page === item.page && Math.abs(r.y - item.y) <= 4)
    if (row) row.cells.push(item)
    else rows.push({ y: item.y, page: item.page, cells: [item] })
  }
  for (const row of rows) row.cells.sort((a, b) => a.x - b.x)
  rows.sort((a, b) => a.page !== b.page ? a.page - b.page : b.y - a.y)

  // Retorna o último valor numérico da linha que contém o padrão
  function findValueInRow(pattern) {
    const row = rows.find(r => r.cells.some(c => pattern.test(c.str)))
    if (!row) return ''
    const nums = row.cells.map(c => c.str.trim()).filter(s => /^[\d.,]+$/.test(s))
    return nums[nums.length - 1] || ''
  }

  // ── Chave de Acesso (44 dígitos, possivelmente com espaços a cada 4) ──────
  const chaveRaw = fullText.match(/(\d[\d\s]{50,60}\d)/)
  let chaveAcesso = ''
  if (chaveRaw) {
    const digits = chaveRaw[1].replace(/\s/g, '')
    if (digits.length === 44) chaveAcesso = digits
  }
  if (!chaveAcesso) {
    // fallback: 44 dígitos contíguos
    const m = fullText.match(/\b(\d{44})\b/)
    if (m) chaveAcesso = m[1]
  }

  // ── Número da NF ──────────────────────────────────────────────────────────
  const numero = cleanNumber(tryMatch(fullText,
    /N[°ºo]\.?\s*([\d.]{1,12})/i,
    /N[ÚU]MERO\s+([\d.]{1,12})/i,
    /NOTA\s+FISCAL[^N]*N[°ºo]\.?\s*([\d.]{1,12})/i,
    /NF-?e\s+N[°ºo]\.?\s*([\d.]{1,12})/i,
  ))

  // ── Data de Emissão ───────────────────────────────────────────────────────
  const dataEmissao = tryMatch(fullText,
    /EMISS[ÃA]O\s+(\d{2}\/\d{2}\/\d{4})/i,
    /DATA\s+DE\s+EMISS[ÃA]O[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    /DATA\s+EMISS[ÃA]O[:\s]+(\d{2}\/\d{2}\/\d{4})/i,
    // fallback: primeira data no documento
    /\b(\d{2}\/\d{2}\/\d{4})\b/,
  )

  // ── CNPJs (todos no documento) ────────────────────────────────────────────
  // Exige a "/" que é obrigatória no formato CNPJ — evita falso-positivo com nº de protocolo
  const cnpjAll = [...fullText.matchAll(/\d{2}\.?\d{3}\.?\d{3}\/\d{4}-?\d{2}/g)]
    .map(m => m[0].replace(/\D/g, ''))
    .filter(c => c.length === 14)

  // ── CPFs (todos no documento) ─────────────────────────────────────────────
  const cpfAll = [...fullText.matchAll(/\d{3}[\s.]?\d{3}[\s.]?\d{3}[\s-]?\d{2}/g)]
    .map(m => m[0].replace(/\D/g, ''))
    .filter(c => c.length === 11)

  // Emitente: primeiro CNPJ; Destinatário: segundo CNPJ (ou primeiro CPF se não houver)
  const emitenteCnpj       = cnpjAll[0] || ''
  const destinatarioCpfCnpj = cnpjAll[1] || cpfAll[0] || ''

  // ── Nomes ────────────────────────────────────────────────────────────────
  // Emitente: geralmente o primeiro grande bloco de texto ou após cabeçalho
  const emitenteNome = afterLabel(fullText,
    'RAZÃO SOCIAL',
    'EMITENTE',
    'NOME DO EMITENTE',
  )

  // Destinatário: após labels de destinatário
  const destinatarioNome = afterLabel(fullText,
    'DESTINATÁRIO[/\\s]*REMETENTE[^N]*NOME[/\\s]*RAZ[ÃA]O SOCIAL',
    'NOME\\s*/\\s*RAZ[ÃA]O SOCIAL',
    'DESTINAT[ÁA]RIO',
  )

  // ── Totais ────────────────────────────────────────────────────────────────
  // Busca posicional: último número na linha que contém o label
  const valorProdutos = parseMoney(
    findValueInRow(/total\s+dos\s+produtos|valor\s+dos\s+produtos|v\.?\s*prod/i) ||
    tryMatch(fullText,
      /total\s+dos\s+produtos\s+([\d.,]+)/i,
      /valor\s+dos\s+produtos\s+([\d.,]+)/i,
    )
  )

  const valorNota = parseMoney(
    findValueInRow(/valor\s+total\s+da\s+nf|valor\s+total\s+da\s+nota|total\s+da\s+nota/i) ||
    tryMatch(fullText,
      /valor\s+total\s+da\s+nf[^e]\s*([\d.,]+)/i,
      /valor\s+total\s+da\s+nota\s+([\d.,]+)/i,
      /valor\s+total\s+da\s+nf-?e\s+([\d.,]+)/i,
    )
  )

  // ── Itens (agrupamento posicional) ───────────────────────────────────────
  // Detecta a linha de cabeçalho da tabela de itens
  const headerRowIdx = rows.findIndex(r =>
    r.cells.some(c => /descri[çc]|produto/i.test(c.str)) &&
    r.cells.some(c => /qtd|quant/i.test(c.str))
  )

  const itens = []
  if (headerRowIdx >= 0) {
    const hdr = rows[headerRowIdx].cells.map(c => c.str.toLowerCase())
    const colDescricao  = hdr.findIndex(h => /descri|produto/i.test(h))
    const colQtd        = hdr.findIndex(h => /qtd|quant/i.test(h))
    const colValorUnit  = hdr.findIndex(h => /unit/i.test(h))
    const colValorTotal = (() => {
      const s = hdr.findIndex(h => /v\.?\s*total|vl\.?\s*total/i.test(h))
      return s >= 0 ? s : hdr.findIndex(h => /total/i.test(h))
    })()

    // Fim da seção de itens: linha de total dos produtos
    const totalRowIdx = rows.findIndex((r, i) =>
      i > headerRowIdx && r.cells.some(c => /total\s+dos\s+produtos/i.test(c.str))
    )
    const endIdx = totalRowIdx >= 0 ? totalRowIdx : rows.length

    for (let i = headerRowIdx + 1; i < endIdx; i++) {
      const cells = rows[i].cells.map(c => c.str)
      if (cells.length < 2) continue
      const descricao     = colDescricao  >= 0 ? cells[colDescricao]  : cells[0]
      const quantidade    = parseMoney(colQtd      >= 0 ? cells[colQtd]      : '')
      const valorUnitario = parseMoney(colValorUnit >= 0 ? cells[colValorUnit] : '')
      const valorTotal    = parseMoney(colValorTotal >= 0 ? cells[colValorTotal] : cells[cells.length - 1])
      if (descricao && !/^[\d.,\s]+$/.test(descricao) && valorTotal > 0) {
        itens.push({ descricao: descricao.trim(), quantidade, valorUnitario, valorTotal })
      }
    }
  }

  // Fallback: regex no texto completo caso agrupamento não encontre cabeçalho
  if (itens.length === 0) {
    const itemRe = /([A-ZÁÉÍÓÚÃÕÇÂÊÎ][\w\s,./()-]{3,60}?)\s+([\d.,]+)\s+[\w/]+\s+([\d.,]+)\s+([\d.,]+)/gi
    for (const m of fullText.matchAll(itemRe)) {
      const total = parseMoney(m[4])
      if (total > 0) {
        itens.push({
          descricao:     m[1].trim(),
          quantidade:    parseMoney(m[2]),
          valorUnitario: parseMoney(m[3]),
          valorTotal:    total,
        })
        if (itens.length >= 100) break
      }
    }
  }

  const result = {
    numero,
    chaveAcesso,
    dataEmissao,
    emitente:     { nome: emitenteNome,       cnpj: emitenteCnpj },
    destinatario: { nome: destinatarioNome,   cpfCnpj: destinatarioCpfCnpj },
    itens,
    totais: { valorProdutos, valorNota },
  }

  console.log('[pdfParser] Resultado:', result)
  return result
}

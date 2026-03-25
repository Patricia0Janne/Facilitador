import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { formatCNPJ, formatCPFCNPJ, formatDate } from '../utils/formatters'

export function exportToExcel(notas) {
  const rows = []

  for (const nota of notas) {
    for (const item of nota.itens) {
      rows.push({
        'NF Número': nota.numero,
        'Data Emissão': formatDate(nota.dataEmissao),
        'Chave de Acesso': nota.chaveAcesso,
        'Emitente': nota.emitente.nome,
        'CNPJ Emitente': formatCNPJ(nota.emitente.cnpj),
        'Destinatário': nota.destinatario.nome,
        'CPF/CNPJ Destinatário': formatCPFCNPJ(nota.destinatario.cpfCnpj),
        'Descrição Item': item.descricao,
        'Quantidade': item.quantidade,
        'Valor Unitário': item.valorUnitario,
        'Valor Total Item': item.valorTotal,
        'Total Produtos': nota.totais.valorProdutos,
        'Total Nota': nota.totais.valorNota,
      })
    }
    if (nota.itens.length === 0) {
      rows.push({
        'NF Número': nota.numero,
        'Data Emissão': formatDate(nota.dataEmissao),
        'Chave de Acesso': nota.chaveAcesso,
        'Emitente': nota.emitente.nome,
        'CNPJ Emitente': formatCNPJ(nota.emitente.cnpj),
        'Destinatário': nota.destinatario.nome,
        'CPF/CNPJ Destinatário': formatCPFCNPJ(nota.destinatario.cpfCnpj),
        'Descrição Item': '',
        'Quantidade': '',
        'Valor Unitário': '',
        'Valor Total Item': '',
        'Total Produtos': nota.totais.valorProdutos,
        'Total Nota': nota.totais.valorNota,
      })
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Notas Fiscais')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'notas_fiscais.xlsx')
}

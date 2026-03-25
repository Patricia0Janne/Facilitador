import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { saveAs } from 'file-saver'
import { formatCNPJ, formatCPFCNPJ, formatCurrency, formatDate } from '../utils/formatters'

export function exportToPDF(nota) {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('NOTA FISCAL ELETRÔNICA', pageW / 2, 20, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nº ${nota.numero}`, pageW / 2, 28, { align: 'center' })

  // Info box
  let y = 38
  doc.setFontSize(9)
  doc.setDrawColor(180)
  doc.rect(10, y - 4, pageW - 20, 22)

  doc.setFont('helvetica', 'bold')
  doc.text('Data de Emissão:', 14, y + 2)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(nota.dataEmissao), 50, y + 2)

  doc.setFont('helvetica', 'bold')
  doc.text('Chave de Acesso:', 14, y + 9)
  doc.setFont('helvetica', 'normal')
  const chave = nota.chaveAcesso || '—'
  doc.text(chave.length > 44 ? chave.substring(0, 44) : chave, 50, y + 9)

  // Emitente
  y += 30
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(230, 235, 245)
  doc.rect(10, y - 5, pageW - 20, 8, 'F')
  doc.text('EMITENTE', 14, y)

  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Nome: ${nota.emitente.nome}`, 14, y)
  y += 5
  doc.text(`CNPJ: ${formatCNPJ(nota.emitente.cnpj)}`, 14, y)

  // Destinatário
  y += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(230, 235, 245)
  doc.rect(10, y - 5, pageW - 20, 8, 'F')
  doc.text('DESTINATÁRIO', 14, y)

  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`Nome: ${nota.destinatario.nome}`, 14, y)
  y += 5
  doc.text(`CPF/CNPJ: ${formatCPFCNPJ(nota.destinatario.cpfCnpj)}`, 14, y)

  // Items table
  y += 12
  autoTable(doc, {
    startY: y,
    head: [['Descrição', 'Qtd', 'Valor Unit.', 'Valor Total']],
    body: nota.itens.map(item => [
      item.descricao,
      item.quantidade.toString(),
      formatCurrency(item.valorUnitario),
      formatCurrency(item.valorTotal),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [63, 81, 181] },
    alternateRowStyles: { fillColor: [245, 247, 255] },
    margin: { left: 10, right: 10 },
  })

  // Totals
  const finalY = doc.lastAutoTable.finalY + 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Valor dos Produtos: ${formatCurrency(nota.totais.valorProdutos)}`, pageW - 14, finalY, { align: 'right' })
  doc.text(`Valor Total da Nota: ${formatCurrency(nota.totais.valorNota)}`, pageW - 14, finalY + 7, { align: 'right' })

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 25
  doc.setDrawColor(180)
  doc.line(10, footerY, pageW - 10, footerY)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const assinatura = nota.rodape?.assinatura || '_______________________________'
  const dataRodape = nota.rodape?.data || new Date().toLocaleDateString('pt-BR')
  doc.text(`Assinatura: ${assinatura}`, 14, footerY + 8)
  doc.text(`Data: ${dataRodape}`, pageW - 14, footerY + 8, { align: 'right' })

  const blob = doc.output('blob')
  saveAs(blob, `NF-${nota.numero || nota.id}.pdf`)
}

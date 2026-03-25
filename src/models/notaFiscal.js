import { v4 as uuidv4 } from 'uuid'

export const STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  STAGING: 'Staging',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  EXPORTED: 'Exported',
  ERROR: 'Error',
}

export function createNotaFiscal(data = {}) {
  return {
    id: uuidv4(),
    status: STATUS.PENDING,
    fileName: '',
    numero: '',
    chaveAcesso: '',
    dataEmissao: '',
    emitente: { nome: '', cnpj: '' },
    destinatario: { nome: '', cpfCnpj: '' },
    itens: [],
    totais: { valorProdutos: 0, valorNota: 0 },
    rodape: { assinatura: '', data: '' },
    errorMessage: '',
    ...data,
  }
}

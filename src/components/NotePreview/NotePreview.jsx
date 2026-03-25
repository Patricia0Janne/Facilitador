import { formatCNPJ, formatCPFCNPJ, formatDate } from '../../utils/formatters'
import ItemsTable from '../ItemsTable/ItemsTable'
import styles from './NotePreview.module.css'

export default function NotePreview({ nota, onChange, readOnly }) {
  function field(label, value, path) {
    return (
      <div className={styles.field}>
        <label className={styles.label}>{label}</label>
        {readOnly ? (
          <span className={styles.value}>{value || '—'}</span>
        ) : (
          <input
            className={styles.input}
            value={value || ''}
            onChange={e => onChange && onChange(path, e.target.value)}
          />
        )}
      </div>
    )
  }

  return (
    <div className={styles.form}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Cabeçalho</h3>
        <div className={styles.grid}>
          {field('Número da Nota', nota.numero, 'numero')}
          {field('Data de Emissão', formatDate(nota.dataEmissao), 'dataEmissao')}
          {field('Chave de Acesso', nota.chaveAcesso, 'chaveAcesso')}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Emitente</h3>
        <div className={styles.grid}>
          {field('Nome', nota.emitente.nome, 'emitente.nome')}
          {field('CNPJ', formatCNPJ(nota.emitente.cnpj), 'emitente.cnpj')}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Destinatário</h3>
        <div className={styles.grid}>
          {field('Nome', nota.destinatario.nome, 'destinatario.nome')}
          {field('CPF/CNPJ', formatCPFCNPJ(nota.destinatario.cpfCnpj), 'destinatario.cpfCnpj')}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Itens</h3>
        <ItemsTable itens={nota.itens} />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Totais</h3>
        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Valor dos Produtos</span>
            <span>{nota.totais.valorProdutos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <div className={`${styles.totalRow} ${styles.totalDestaque}`}>
            <span>Valor Total da Nota</span>
            <span>{nota.totais.valorNota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Rodapé</h3>
        <div className={styles.grid}>
          {field('Assinatura', nota.rodape?.assinatura, 'rodape.assinatura')}
          {field('Data', nota.rodape?.data, 'rodape.data')}
        </div>
      </section>
    </div>
  )
}

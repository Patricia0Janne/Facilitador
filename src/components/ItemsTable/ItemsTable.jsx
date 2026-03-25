import { formatCurrency } from '../../utils/formatters'
import styles from './ItemsTable.module.css'

export default function ItemsTable({ itens }) {
  if (!itens || itens.length === 0) {
    return <p className={styles.empty}>Nenhum item encontrado</p>
  }
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>Valor Unit.</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => (
            <tr key={i}>
              <td>{item.descricao}</td>
              <td>{item.quantidade}</td>
              <td>{formatCurrency(item.valorUnitario)}</td>
              <td>{formatCurrency(item.valorTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

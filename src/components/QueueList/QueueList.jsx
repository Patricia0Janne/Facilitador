import { useNavigate } from 'react-router-dom'
import { useQueue } from '../../store/QueueContext'
import styles from './QueueList.module.css'

const STATUS_COLOR = {
  Pending: '#ff9800',
  Processing: '#2196f3',
  Staging: '#9c27b0',
  Approved: '#4caf50',
  Rejected: '#f44336',
  Exported: '#607d8b',
  Error: '#e53935',
}

export default function QueueList() {
  const { state, dispatch } = useQueue()
  const navigate = useNavigate()

  if (state.queue.length === 0) {
    return <p className={styles.empty}>Nenhuma nota na fila</p>
  }

  return (
    <div className={styles.list}>
      {state.queue.map(nota => (
        <div key={nota.id} className={styles.item}>
          <div className={styles.info}>
            <span className={styles.name}>
              {nota.numero ? `NF ${nota.numero}` : nota.fileName || 'Nota sem número'}
            </span>
            <span
              className={styles.badge}
              style={{ background: STATUS_COLOR[nota.status] || '#999' }}
            >
              {nota.status}
            </span>
          </div>
          {nota.errorMessage && <p className={styles.error}>{nota.errorMessage}</p>}
          <div className={styles.actions}>
            {nota.status === 'Staging' && (
              <button className={styles.btnPreview} onClick={() => navigate(`/preview/${nota.id}`)}>
                Visualizar
              </button>
            )}
            {nota.status === 'Approved' && (
              <button className={styles.btnPreview} onClick={() => navigate(`/preview/${nota.id}`)}>
                Ver / Exportar
              </button>
            )}
            <button
              className={styles.btnRemove}
              onClick={() => dispatch({ type: 'REMOVE_NOTA', payload: nota.id })}
            >
              Remover
            </button>
          </div>
        </div>
      ))}
      {state.queue.some(n => n.status === 'Exported') && (
        <button
          className={styles.btnClear}
          onClick={() => dispatch({ type: 'CLEAR_EXPORTED' })}
        >
          Limpar exportadas
        </button>
      )}
    </div>
  )
}

import { useParams, useNavigate } from 'react-router-dom'
import { useQueue } from '../../store/QueueContext'
import { STATUS } from '../../models/notaFiscal'
import NotePreview from '../../components/NotePreview/NotePreview'
import ExportButtons from '../../components/ExportButtons/ExportButtons'
import styles from './PreviewPage.module.css'

export default function PreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useQueue()

  const nota = state.queue.find(n => n.id === id)

  if (!nota) {
    return (
      <div className={styles.notFound}>
        <p>Nota não encontrada.</p>
        <button onClick={() => navigate('/')}>Voltar</button>
      </div>
    )
  }

  function handleChange(path, value) {
    const updated = { ...nota }
    const parts = path.split('.')
    if (parts.length === 1) {
      updated[parts[0]] = value
    } else if (parts.length === 2) {
      updated[parts[0]] = { ...updated[parts[0]], [parts[1]]: value }
    }
    dispatch({ type: 'UPDATE_NOTA', payload: updated })
  }

  function handleConfirm() {
    dispatch({ type: 'SET_STATUS', payload: { id: nota.id, status: STATUS.APPROVED } })
  }

  function handleReject() {
    dispatch({ type: 'SET_STATUS', payload: { id: nota.id, status: STATUS.REJECTED } })
    navigate('/')
  }

  function handleExported() {
    dispatch({ type: 'SET_STATUS', payload: { id: nota.id, status: STATUS.EXPORTED } })
  }

  const isEditable = nota.status === STATUS.STAGING
  const isApproved = nota.status === STATUS.APPROVED || nota.status === STATUS.EXPORTED

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Voltar</button>
        <h1 className={styles.title}>
          {nota.numero ? `NF ${nota.numero}` : 'Preview da Nota'}
        </h1>
        <span className={styles.status} data-status={nota.status}>{nota.status}</span>
      </header>

      <div className={styles.content}>
        <NotePreview nota={nota} onChange={isEditable ? handleChange : null} readOnly={!isEditable} />

        <div className={styles.actionBar}>
          {isEditable && (
            <>
              <button className={styles.btnConfirm} onClick={handleConfirm}>
                Confirmar
              </button>
              <button className={styles.btnReject} onClick={handleReject}>
                Rejeitar
              </button>
            </>
          )}
          {isApproved && (
            <ExportButtons nota={nota} onExported={handleExported} />
          )}
        </div>
      </div>
    </div>
  )
}

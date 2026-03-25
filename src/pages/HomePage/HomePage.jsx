import { useState } from 'react'
import { useQueue } from '../../store/QueueContext'
import { createNotaFiscal, STATUS } from '../../models/notaFiscal'
import { parseXML } from '../../services/xmlParser'
import { parsePDF } from '../../services/pdfParser'
import { fetchNotaByChave } from '../../services/nfeioService'
import UploadArea from '../../components/UploadArea/UploadArea'
import QueueList from '../../components/QueueList/QueueList'
import Settings from '../../components/Settings/Settings'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { state, dispatch } = useQueue()
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  async function handleFilesAdded(files) {
    const notas = files.map(f => createNotaFiscal({ fileName: f.name }))
    dispatch({ type: 'ADD_NOTES', payload: notas })

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const nota = notas[i]
      dispatch({ type: 'SET_STATUS', payload: { id: nota.id, status: STATUS.PROCESSING } })
      try {
        let parsed
        if (file.name.endsWith('.xml')) {
          const text = await file.text()
          parsed = await parseXML(text)
        } else if (file.name.endsWith('.pdf')) {
          const buf = await file.arrayBuffer()
          parsed = await parsePDF(buf)
        }
        dispatch({
          type: 'UPDATE_NOTA',
          payload: { ...nota, ...parsed, id: nota.id, status: STATUS.STAGING, fileName: file.name },
        })
      } catch (err) {
        dispatch({
          type: 'SET_STATUS',
          payload: { id: nota.id, status: STATUS.ERROR, errorMessage: err.message },
        })
      }
    }
  }

  async function handleChaveConsultar(chave) {
    setLoading(true)
    const nota = createNotaFiscal({ fileName: `Chave: ${chave.substring(0, 8)}...`, chaveAcesso: chave })
    dispatch({ type: 'ADD_NOTES', payload: [nota] })
    dispatch({ type: 'SET_STATUS', payload: { id: nota.id, status: STATUS.PROCESSING } })
    try {
      const apiKey = localStorage.getItem('nfeio_apikey') || ''
      const orgId = localStorage.getItem('nfeio_orgid') || ''
      const parsed = await fetchNotaByChave(chave, apiKey, orgId)
      dispatch({
        type: 'UPDATE_NOTA',
        payload: { ...nota, ...parsed, id: nota.id, status: STATUS.STAGING },
      })
    } catch (err) {
      dispatch({
        type: 'SET_STATUS',
        payload: { id: nota.id, status: STATUS.ERROR, errorMessage: err.message },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Facilitador</h1>
          <span className={styles.subtitle}>NF-e → Formulário</span>
        </div>
        <button className={styles.settingsBtn} onClick={() => setShowSettings(true)}>
          ⚙ Configurações
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.leftPanel}>
          <h2 className={styles.panelTitle}>Adicionar Notas</h2>
          <UploadArea
            onFilesAdded={handleFilesAdded}
            onChaveConsultar={handleChaveConsultar}
            loading={loading}
          />
        </section>

        <section className={styles.rightPanel}>
          <div className={styles.queueHeader}>
            <h2 className={styles.panelTitle}>Fila de Processamento</h2>
            <span className={styles.queueCount}>{state.queue.length} nota(s)</span>
          </div>
          <QueueList />
        </section>
      </main>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

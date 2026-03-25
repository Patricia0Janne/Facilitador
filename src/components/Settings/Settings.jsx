import { useState, useEffect } from 'react'
import styles from './Settings.module.css'

export default function Settings({ onClose }) {
  const [nfeioKey, setNfeioKey]   = useState('')
  const [nfeioOrg, setNfeioOrg]   = useState('')
  const [docaiToken, setDocaiToken] = useState('')
  const [docaiProject, setDocaiProject] = useState('')
  const [docaiProcessor, setDocaiProcessor] = useState('')
  const [docaiLocation, setDocaiLocation]   = useState('us')

  useEffect(() => {
    setNfeioKey(localStorage.getItem('nfeio_apikey')       || '')
    setNfeioOrg(localStorage.getItem('nfeio_orgid')        || '')
    setDocaiToken(localStorage.getItem('docai_token')      || '')
    setDocaiProject(localStorage.getItem('docai_projectid')    || '')
    setDocaiProcessor(localStorage.getItem('docai_processorid') || '')
    setDocaiLocation(localStorage.getItem('docai_location')    || 'us')
  }, [])

  function save() {
    localStorage.setItem('nfeio_apikey',       nfeioKey)
    localStorage.setItem('nfeio_orgid',        nfeioOrg)
    localStorage.setItem('docai_token',        docaiToken)
    localStorage.setItem('docai_projectid',    docaiProject)
    localStorage.setItem('docai_processorid',  docaiProcessor)
    localStorage.setItem('docai_location',     docaiLocation)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Configurações</h2>

        {/* ── Google Document AI ───────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Google Document AI — Leitura de PDF</h3>
          <p className={styles.hint}>
            Quando configurado, o app usa o Document AI para extrair os dados do PDF com alta precisão.
            Crie um processador do tipo <strong>Form Parser</strong> em{' '}
            <strong>console.cloud.google.com → Document AI</strong>.
          </p>

          <div className={styles.field}>
            <label>Access Token</label>
            <input
              type="password"
              value={docaiToken}
              onChange={e => setDocaiToken(e.target.value)}
              placeholder="ya29..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Project ID</label>
              <input
                type="text"
                value={docaiProject}
                onChange={e => setDocaiProject(e.target.value)}
                placeholder="meu-projeto-123"
              />
            </div>
            <div className={styles.field}>
              <label>Location</label>
              <select
                value={docaiLocation}
                onChange={e => setDocaiLocation(e.target.value)}
                className={styles.select}
              >
                <option value="us">us (EUA)</option>
                <option value="eu">eu (Europa)</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label>Processor ID</label>
            <input
              type="text"
              value={docaiProcessor}
              onChange={e => setDocaiProcessor(e.target.value)}
              placeholder="abc1234def567890"
            />
          </div>
        </div>

        {/* ── NFe.io ──────────────────────────────────────── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>NFe.io — Consulta por Chave de Acesso</h3>

          <div className={styles.field}>
            <label>API Key</label>
            <input
              type="password"
              value={nfeioKey}
              onChange={e => setNfeioKey(e.target.value)}
              placeholder="Sua API Key do NFe.io"
            />
          </div>

          <div className={styles.field}>
            <label>Organization ID</label>
            <input
              type="text"
              value={nfeioOrg}
              onChange={e => setNfeioOrg(e.target.value)}
              placeholder="ID da organização no NFe.io"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnSave} onClick={save}>Salvar</button>
          <button className={styles.btnCancel} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

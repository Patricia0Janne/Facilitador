import { useState, useRef } from 'react'
import { validateChaveAcesso } from '../../utils/validators'
import styles from './UploadArea.module.css'

export default function UploadArea({ onFilesAdded, onChaveConsultar, loading }) {
  const [dragging, setDragging] = useState(false)
  const [chave, setChave] = useState('')
  const inputRef = useRef(null)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.xml') || f.name.endsWith('.pdf'))
    if (files.length) onFilesAdded(files)
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (files.length) onFilesAdded(files)
    e.target.value = ''
  }

  function handleConsultar() {
    if (!validateChaveAcesso(chave)) {
      alert('Chave de acesso inválida. Deve conter 44 dígitos.')
      return
    }
    onChaveConsultar(chave.replace(/\D/g, ''))
    setChave('')
  }

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <span className={styles.icon}>📂</span>
        <p className={styles.label}>Arraste XMLs ou PDFs aqui</p>
        <p className={styles.sublabel}>ou clique para selecionar</p>
        <input ref={inputRef} type="file" multiple accept=".xml,.pdf" onChange={handleFiles} style={{ display: 'none' }} />
      </div>

      <div className={styles.chaveArea}>
        <input
          type="text"
          className={styles.chaveInput}
          placeholder="Consultar por chave de acesso (44 dígitos)"
          value={chave}
          onChange={e => setChave(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleConsultar()}
          maxLength={48}
        />
        <button className={styles.chaveBtn} onClick={handleConsultar} disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>
    </div>
  )
}

import { exportToPDF } from '../../services/pdfExport'
import { exportToExcel } from '../../services/excelExport'
import styles from './ExportButtons.module.css'

export default function ExportButtons({ nota, onExported }) {
  function handlePDF() {
    exportToPDF(nota)
    onExported && onExported()
  }

  function handleExcel() {
    exportToExcel([nota])
    onExported && onExported()
  }

  return (
    <div className={styles.container}>
      <button className={styles.pdfBtn} onClick={handlePDF}>
        Baixar PDF
      </button>
      <button className={styles.excelBtn} onClick={handleExcel}>
        Baixar Excel
      </button>
    </div>
  )
}

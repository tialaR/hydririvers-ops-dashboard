import { AlertTriangle, FileText } from 'lucide-react';
import styles from './documents-occurrence.module.sass';

const documents = [
  { label: 'NF-e', meta: 'Emitida 13:02', status: 'Pronta', tone: 'success' },
  { label: 'Romaneio', meta: 'Revisado 13:18', status: 'Pronto', tone: 'success' },
  { label: 'Comprovante de coleta', meta: 'Foto + assinatura', status: 'Pronto', tone: 'success' },
  { label: 'Manifesto', meta: 'Volume 18,4 t', status: 'Divergente', tone: 'warning' },
  { label: 'Boletim de trecho', meta: 'Contexto hidroviário', status: 'DEMO', tone: 'demo' },
] as const;

export function CargoDocumentsEvidencePanel() {
  return (
    <article className={styles.documentsPanel} data-testid="page62-d06-documents">
      <h3 className={styles.panelTitle}>Documentos da carga</h3>
      <div className={styles.documentList}>
        {documents.map((document) => (
          <div className={styles.documentRow} data-tone={document.tone} key={document.label}>
            <span className={styles.documentIcon} aria-hidden>
              {document.tone === 'warning' ? <AlertTriangle size={20} /> : <FileText size={18} />}
            </span>
            <span className={styles.documentCopy}>
              <strong>{document.label}</strong>
              <span>{document.meta}</span>
            </span>
            <span className={styles.documentStatus} data-tone={document.tone}>{document.status}</span>
          </div>
        ))}
      </div>
      <div className={styles.documentActions}>
        <button type="button">Pré-visualizar evidência</button>
        <button type="button">Corrigir manifesto →</button>
      </div>
    </article>
  );
}

'use client';

import { FileCheck2, FileText, Scale, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EvidenceFolderItem, type EvidenceFolderTone } from '@/shared/design-system/components/evidence-folder-item';

import styles from './documents-occurrence.module.sass';

const documents = [
  {
    id: 'doc-nfe',
    label: 'NF-e',
    subtitle: 'Documento fiscal da mercadoria',
    meta: 'Emitida 13:02',
    status: 'Pronta',
    tone: 'success' as EvidenceFolderTone,
    icon: FileText,
    owner: 'Embarcadora',
    evidence: '1 evidência vinculada',
    action: 'Visualizar documento',
  },
  {
    id: 'doc-cte',
    label: 'CT-e',
    subtitle: 'Serviço de transporte',
    meta: 'Validado há 26 min',
    status: 'Validado',
    tone: 'success' as EvidenceFolderTone,
    icon: FileCheck2,
    owner: 'Transportador',
    evidence: '1 evidência vinculada',
    action: 'Visualizar documento',
  },
  {
    id: 'doc-collection-proof',
    label: 'Comprovante de coleta',
    subtitle: 'Foto + assinatura da coleta',
    meta: 'Atualizado 13:18',
    status: 'Pronto',
    tone: 'success' as EvidenceFolderTone,
    icon: FileCheck2,
    owner: 'Embarcadora',
    evidence: '2 evidências vinculadas',
    action: 'Visualizar evidências',
  },
  {
    id: 'doc-mdfe',
    label: 'MDF-e',
    subtitle: 'Manifesto eletrônico da operação',
    meta: 'Atualizado há 12 min',
    status: 'Divergente',
    tone: 'warning' as EvidenceFolderTone,
    icon: Scale,
    owner: 'Transportador',
    evidence: '18,4 t enviado · 16,8 t comprovado',
    action: 'Corrigir divergência',
  },
  {
    id: 'doc-hydro',
    label: 'Boletim de trecho',
    subtitle: 'Contexto hidroviário da viagem · DEMO',
    meta: 'Fonte prevista: ANA/Hidroweb · 18 min',
    status: 'Informativo',
    tone: 'info' as EvidenceFolderTone,
    icon: ShieldCheck,
    owner: 'Sistema HydroRivers',
    evidence: 'Condição do corredor e freshness',
    action: 'Abrir contexto hidroviário',
  },
] as const;

type CargoDocumentsEvidencePanelProps = {
  onPreviewEvidence?: () => void;
  onCorrectManifest?: () => void;
};

export function CargoDocumentsEvidencePanel({
  onPreviewEvidence,
  onCorrectManifest,
}: CargoDocumentsEvidencePanelProps = {}) {
  const [selectedId, setSelectedId] = useState('doc-mdfe');
  const selected = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? documents[0],
    [selectedId],
  );

  const handlePrimaryAction = () => {
    if (selected.id === 'doc-mdfe') {
      onCorrectManifest?.();
      return;
    }
    onPreviewEvidence?.();
  };

  return (
    <article className={styles.documentsPanel} data-testid="page62-d06-documents">
      <header className={styles.documentsHeader}>
        <div>
          <small>DOCUMENTOS & EVIDÊNCIAS</small>
          <h3>Documentos da carga</h3>
          <p>Selecione um item para revisar estado, responsabilidade e evidências vinculadas.</p>
        </div>
        <span className={styles.documentCount}>5 itens</span>
      </header>

      <div className={styles.documentList} aria-label="Documentos da carga">
        {documents.map((document) => (
          <EvidenceFolderItem
            key={document.id}
            title={document.label}
            subtitle={document.subtitle}
            meta={document.meta}
            statusLabel={document.status}
            tone={document.tone}
            variant="row"
            selected={selected.id === document.id}
            icon={document.icon}
            onClick={() => setSelectedId(document.id)}
            testId={`document-row-${document.id}`}
          />
        ))}
      </div>

      <section className={styles.documentInspector} data-testid="document-inspector">
        <div className={styles.documentInspectorLead}>
          <small>ITEM SELECIONADO</small>
          <strong>{selected.label}</strong>
          <span>{selected.subtitle}</span>
        </div>

        <div className={styles.documentInspectorFacts}>
          <span>
            <small>Responsável</small>
            <strong>{selected.owner}</strong>
          </span>
          <span>
            <small>Evidência</small>
            <strong>{selected.evidence}</strong>
          </span>
        </div>

        <button type="button" onClick={handlePrimaryAction}>
          {selected.action}
        </button>
      </section>
    </article>
  );
}

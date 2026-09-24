export type TooltipRow = {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'warning' | 'critical' | 'info';
};

const toneColor: Record<NonNullable<TooltipRow['tone']>, string> = {
  neutral: '#a1a1aa',
  success: '#34d399',
  warning: '#fbbf24',
  critical: '#fb7185',
  info: '#60a5fa',
};

export function buildOperationalTooltip({
  eyebrow,
  title,
  rows,
  footer,
}: {
  eyebrow?: string;
  title: string;
  rows: TooltipRow[];
  footer?: string;
}) {
  const rowMarkup = rows
    .map((row) => `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:4px 0;">
        <span style="color:#a1a1aa;font-size:11px;">${row.label}</span>
        <strong style="color:${toneColor[row.tone ?? 'neutral']};font-size:12px;font-weight:650;">${row.value}</strong>
      </div>`)
    .join('');

  return `
    <div style="min-width:190px;padding:2px 1px 0;">
      ${eyebrow ? `<div style="margin-bottom:4px;color:#71717a;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${eyebrow}</div>` : ''}
      <div style="margin-bottom:8px;color:#f4f4f5;font-size:13px;font-weight:700;">${title}</div>
      <div style="border-top:1px solid #2d2d31;padding-top:6px;">${rowMarkup}</div>
      ${footer ? `<div style="margin-top:7px;padding-top:7px;border-top:1px solid #2d2d31;color:#71717a;font-size:10px;line-height:1.4;">${footer}</div>` : ''}
    </div>`;
}

export const operationalTooltipShell = {
  backgroundColor: 'rgba(18,18,20,.98)',
  borderColor: '#3b3b40',
  borderWidth: 1,
  padding: 10,
  extraCssText: 'box-shadow:0 16px 38px rgba(0,0,0,.34);border-radius:12px;backdrop-filter:blur(14px);',
  textStyle: { color: '#f4f4f5', fontSize: 11 },
};

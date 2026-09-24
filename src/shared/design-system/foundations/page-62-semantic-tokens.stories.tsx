import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const colors = [
  ['Canvas', '--hy-p62-canvas'],
  ['Surface', '--hy-p62-surface'],
  ['Raised', '--hy-p62-surface-raised'],
  ['Border', '--hy-p62-border'],
  ['Text', '--hy-p62-text'],
  ['Muted', '--hy-p62-muted'],
  ['Accent', '--hy-p62-accent'],
  ['Info', '--hy-p62-info'],
  ['Success', '--hy-p62-success'],
  ['Warning', '--hy-p62-warning'],
  ['Critical', '--hy-p62-critical'],
] as const;

const statuses = [
  ['Open', '--hy-p62-status-open'],
  ['In transit', '--hy-p62-status-in-transit'],
  ['Delivered', '--hy-p62-status-delivered'],
  ['Attention', '--hy-p62-status-attention'],
  ['Blocked', '--hy-p62-status-blocked'],
] as const;

function Page62Foundations() {
  return (
    <div style={{ width: 'min(100%, 64rem)', display: 'grid', gap: '2rem' }}>
      <section>
        <h2 style={{ margin: '0 0 1rem' }}>Page 62 · semantic colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
          {colors.map(([label, token]) => (
            <div key={token} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: `var(${token})`, border: '0.0625rem solid var(--hy-p62-border)' }} />
              <div><strong>{label}</strong><div style={{ opacity: 0.65, fontSize: '0.7rem' }}>{token}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 1rem' }}>Operational status semantics</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {statuses.map(([label, token]) => (
            <span key={token} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minHeight: '2rem', padding: '0 0.75rem', border: '0.0625rem solid var(--hy-p62-border)', borderRadius: '999rem' }}>
              <i style={{ width: '0.55rem', height: '0.55rem', borderRadius: '50%', background: `var(${token})` }} />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 1rem' }}>Responsive contract</h2>
        <p style={{ maxWidth: '48rem', lineHeight: 1.55, margin: 0, color: 'var(--hy-p62-muted)' }}>
          Desktop maximizes simultaneous operational reading. When width is insufficient, charts and map surfaces stack instead of compressing until labels collide. Intelligence is preserved; simultaneity is reduced.
        </p>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Page 62 Contract',
  component: Page62Foundations,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Semantic color, status, spacing, typography and responsive contract for Page 62. New Page 62 styles use rem-based geometry and semantic CSS variables.',
      },
    },
  },
} satisfies Meta<typeof Page62Foundations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TokensAndBehavior: Story = {};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const colorTokens = [
  ['Canvas', '--hy-page61-color-canvas'],
  ['Panel', '--hy-page61-color-panel'],
  ['List', '--hy-page61-color-list'],
  ['Sidebar', '--hy-page61-color-sidebar'],
  ['Surface', '--hy-page61-color-surface'],
  ['Text', '--hy-page61-color-text'],
  ['Muted', '--hy-page61-color-muted'],
  ['Attention', '--hy-page61-color-attention'],
  ['Danger', '--hy-page61-color-danger'],
  ['Success', '--hy-page61-color-success'],
] as const;

const spacingTokens = [
  ['1', '--hy-page61-space-1'],
  ['2', '--hy-page61-space-2'],
  ['3', '--hy-page61-space-3'],
  ['4', '--hy-page61-space-4'],
  ['5', '--hy-page61-space-5'],
  ['6', '--hy-page61-space-6'],
  ['8', '--hy-page61-space-8'],
] as const;

function Page61Foundations() {
  return (
    <div style={{ width: 'min(100%, 920px)', display: 'grid', gap: '2rem' }}>
      <section>
        <h2 style={{ margin: '0 0 1rem' }}>Page 61 · semantic colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
          {colorTokens.map(([label, token]) => (
            <div key={token} style={{ display: 'grid', gridTemplateColumns: '3rem 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: `var(${token})`, border: '1px solid var(--hy-page61-color-line)' }} />
              <div>
                <strong>{label}</strong>
                <div style={{ opacity: 0.7, fontSize: '0.8rem' }}>{token}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 1rem' }}>Spacing scale</h2>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {spacingTokens.map(([label, token]) => (
            <div key={token} style={{ display: 'grid', gridTemplateColumns: '4rem 1fr', gap: '1rem', alignItems: 'center' }}>
              <code>{label}</code>
              <span style={{ display: 'block', width: `var(${token})`, minWidth: '0.25rem', height: '0.75rem', borderRadius: '999px', background: 'var(--hy-page61-color-attention)' }} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 1rem' }}>Geometry contract</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.5rem 1rem', margin: 0 }}>
          <dt>Sidebar</dt><dd style={{ margin: 0 }}>17rem / 272px</dd>
          <dt>Header</dt><dd style={{ margin: 0 }}>3.5rem / 56px</dd>
          <dt>Master</dt><dd style={{ margin: 0 }}>25rem / 400px</dd>
          <dt>Map</dt><dd style={{ margin: 0 }}>28rem / 448px</dd>
          <dt>Shipment card</dt><dd style={{ margin: 0 }}>24.125rem / 386px canonical target</dd>
        </dl>
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Page 61 Contract',
  component: Page61Foundations,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Page 61 token contract. rem is used for scalable typography/spacing; fixed desktop geometry stays explicit where the Figma contract requires exact anchors.',
      },
    },
  },
} satisfies Meta<typeof Page61Foundations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TokensAndGeometry: Story = {};

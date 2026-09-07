import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/shared/ui/button';

import { BottomSheet, type BottomSheetProps } from './BottomSheet';

function StatefulBottomSheet(props: BottomSheetProps) {
  const [open, setOpen] = useState(props.open);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir painel</Button>
      <BottomSheet {...props} open={open} onOpenChange={setOpen} />
    </>
  );
}

const sampleContent: ReactNode = (
  <div style={{ display: 'grid', gap: 12 }}>
    <p style={{ margin: 0 }}>Contexto operacional preservado durante a navegação.</p>
    <Button variant="secondary">Ação contextual</Button>
  </div>
);

const meta = {
  title: 'Patterns/BottomSheet',
  component: BottomSheet,
  render: (args) => <StatefulBottomSheet {...args} />,
  args: {
    open: true,
    title: 'Detalhes da carga',
    description: 'Atualizado há 4 minutos',
    children: sampleContent,
    dragHandleAriaLabel: 'Ajustar altura dos detalhes da carga',
  },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'BottomSheet de produção com portal, foco contido, retorno de foco, Escape, overlay e snap por gesto ou teclado.' } },
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Light: Story = { args: { variant: 'light', overlayVariant: 'light' } };
export const Strong: Story = { args: { variant: 'strong', overlayVariant: 'strong' } };
export const WithFooter: Story = { args: { footer: <Button>Confirmar ação</Button> } };
export const NamedSnaps: Story = {
  args: {
    viewportAnchor: 'flush',
    snapHeights: { partial: '44dvh', expanded: '88dvh' },
    snapOrder: ['partial', 'expanded'],
    initialSnap: 'partial',
  },
};
export const OverlayLocked: Story = { args: { closeOnOverlayClick: false } };

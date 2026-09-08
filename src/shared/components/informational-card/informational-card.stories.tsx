import { AlertTriangle, CheckCircle2, Info, PackageOpen } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/shared/components/button';

import { InformationalCard } from './InformationalCard';

const meta = {
  title: 'Feedback/InformationalCard',
  component: InformationalCard,
  args: {
    icon: <Info aria-hidden />,
    title: 'Informação operacional',
    description: 'Use este espaço para orientar a próxima ação sem interromper o fluxo.',
  },
  decorators: [(Story) => <div style={{ width: 'min(100%, 430px)', padding: '16px' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'Shared non-interactive feedback surface for empty, success, warning and failure states.' } },
  },
} satisfies Meta<typeof InformationalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InfoState: Story = {};
export const EmptyState: Story = {
  args: { tone: 'neutral', icon: <PackageOpen aria-hidden />, title: 'Nenhuma carga encontrada', description: 'Ajuste os filtros para ampliar os resultados.' },
};
export const SuccessState: Story = {
  args: { tone: 'success', icon: <CheckCircle2 aria-hidden />, title: 'Operação concluída', description: 'A atualização foi registrada com segurança.' },
};
export const WarningState: Story = {
  args: { tone: 'warning', icon: <AlertTriangle aria-hidden />, title: 'Documento perto do vencimento', description: 'Revise a documentação antes da próxima etapa.' },
};
export const DangerWithAction: Story = {
  args: {
    tone: 'danger',
    icon: <AlertTriangle aria-hidden />,
    title: 'Não foi possível carregar os dados',
    description: 'Tente novamente para recuperar a visão operacional.',
    action: <Button variant="secondary">Tentar novamente</Button>,
  },
};

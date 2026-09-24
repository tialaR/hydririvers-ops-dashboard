import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { OperationalScheduleList } from './operational-schedule-list';

const meta = {
  title: 'Patterns/Operational Schedule List',
  component: OperationalScheduleList,
  tags: ['autodocs'],
  args: {
    title: 'Marcos operacionais',
    items: [
      { id: 'a', time: '16:12', title: 'Aceite registrado', subtitle: 'Decisão comercial persistida', status: 'Concluído', tone: 'success', icon: 'check' },
      { id: 'b', time: '17:10', title: 'Posição atualizada', subtitle: 'AIS + GPS', status: 'Recente', tone: 'info', icon: 'radio' },
      { id: 'c', time: '18:30', title: 'Chegada estimada', subtitle: 'Santarém', status: 'Próximo', tone: 'warning', icon: 'calendar' },
    ],
  },
} satisfies Meta<typeof OperationalScheduleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {};

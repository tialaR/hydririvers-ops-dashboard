import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Surface } from './surface';

const meta = {
  title: 'Primitives/Surface',
  component: Surface,
  args: { children: 'Contexto operacional HydroRivers', tone: 'default', padding: 'lg', semanticRole: 'card' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'glass', 'elevated'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
    semanticRole: { control: 'select', options: ['card', 'cardElevated', 'panel', 'sheet', 'overlay'] },
  },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Glass: Story = { args: { tone: 'glass' } };
export const Elevated: Story = { args: { tone: 'elevated', semanticRole: 'cardElevated' } };
export const Interactive: Story = { args: { interactive: true, role: 'button', tabIndex: 0, 'aria-label': 'Abrir contexto operacional' } };

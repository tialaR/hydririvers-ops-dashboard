import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { IconButton } from './icon-button';

const meta = {
  title: 'Primitives/IconButton',
  component: IconButton,
  args: { ariaLabel: 'Abrir filtros', iconName: 'filter', iconButtonRole: 'field' },
  argTypes: {
    iconName: { control: 'select', options: ['notifications', 'profile', 'filter', 'close', 'settings', 'plus', 'cargo', 'route'] },
    iconButtonRole: { control: 'inline-radio', options: ['header', 'page', 'field', 'sheet'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Active: Story = { args: { active: true, 'aria-pressed': true } };
export const WithBadge: Story = { args: { iconName: 'notifications', ariaLabel: 'Notificações, 3 não lidas', badgeContent: 3 } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

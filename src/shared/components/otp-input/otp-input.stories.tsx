import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { OtpInput } from './OtpInput';

const commonArgs = {
  onChange: () => undefined,
  groupLabel: 'Código de verificação',
  digitAriaLabel: (index: number) => `Dígito ${index} do código`,
};

const meta = {
  title: 'Forms/OtpInput',
  component: OtpInput,
  args: { ...commonArgs, value: '' },
  decorators: [(Story) => <div style={{ width: 'min(100%, 420px)', padding: '16px' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'Accessible one-time-code entry with numeric slots, keyboard flow and validation states.' } },
  },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: '428195' } };
export const Invalid: Story = {
  args: { value: '428195', invalid: true, describedBy: 'otp-story-error' },
  render: (args) => (
    <div>
      <OtpInput {...args} />
      <p id="otp-story-error">O código informado não é válido.</p>
    </div>
  ),
};
export const Disabled: Story = { args: { value: '428195', disabled: true } };

function ControlledOtpStory() {
  const [value, setValue] = useState('');
  return <OtpInput {...commonArgs} value={value} onChange={setValue} />;
}

export const Interactive: Story = { render: () => <ControlledOtpStory /> };

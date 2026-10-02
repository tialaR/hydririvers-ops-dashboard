'use client';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AuthForm } from './auth-form';

const meta = {
  title: 'Product/Auth/Auth Form',
  component: AuthForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Canonical HydroRivers authentication surface. Login and registration both advance to OTP inside the same component.',
      },
    },
  },
} satisfies Meta<typeof AuthForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  args: {
    mode: 'login',
    loginPrefill: 'tiala@hydrorivers.com',
  },
};

export const Register: Story = {
  args: {
    mode: 'register',
  },
};

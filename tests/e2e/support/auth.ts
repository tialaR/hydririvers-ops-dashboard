import { expect, type Page } from '@playwright/test';

const submitButtonName = /^(entrar|login|sign in|acceder|continuar|confirmar|validar otp|validate otp)$/i;

const defaultShipper = {
  email: 'tiala@hydrorivers.com',
  password: 'hydro123',
  phone: '91999990001',
} as const;

export type OtpCredentials = {
  email: string;
  password: string;
  phone?: string;
};

export async function loginWithOtp(page: Page, credentials: OtpCredentials = defaultShipper) {
  await page.goto('/pt-BR/login');

  const emailInput = page.getByRole('textbox', { name: /e-?mail|email|correo/i });
  const passwordInput = page.getByLabel(/senha|password/i);
  const phoneInput = page.getByRole('textbox', { name: /número com ddd|phone number/i });
  const submitButton = page.getByRole('button', { name: submitButtonName }).first();
  const phone = credentials.phone ?? defaultShipper.phone;

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(phoneInput).toBeVisible();
  await expect(submitButton).toBeVisible();

  await emailInput.fill(credentials.email);
  await passwordInput.fill(credentials.password);
  await phoneInput.fill(phone);
  await expect(submitButton).toBeEnabled();

  const [firstLoginResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    ),
    submitButton.click()
  ]);

  const firstLoginBody = await firstLoginResponse.json();
  expect(firstLoginBody.otpRequired).toBe(true);
  expect(typeof firstLoginBody.otpCode).toBe('string');
  expect(typeof firstLoginBody.challenge).toBe('string');

  const otpGroup = page.getByRole('group', { name: /Código de verificação/i });
  await expect(otpGroup).toBeVisible();
  const otpDigits = firstLoginBody.otpCode.replace(/\D/g, '');
  const otpInputs = otpGroup.locator('input');
  for (let index = 0; index < otpDigits.length; index += 1) {
    await otpInputs.nth(index).fill(otpDigits[index]!);
  }

  const otpSubmitButton = page.getByRole('button', { name: submitButtonName }).first();
  await expect(otpSubmitButton).toBeEnabled();

  const [secondLoginResponse] = await Promise.all([
    page.waitForResponse((response) =>
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    ),
    otpSubmitButton.click()
  ]);

  expect(secondLoginResponse.status()).toBe(200);
}

import { test, expect } from '@playwright/test';

const BASE_URL = 'https://vlex-mu.vercel.app';

async function loginOnce(page) {
  // Ir para /admin e aguardar o formulário de login ficar visível
  await page.goto(`${BASE_URL}/admin/`);
  await page.waitForSelector('#email', { state: 'visible' });

  // Garantir que os campos não estão auto-preenchidos
  const email = page.locator('#email');
  const password = page.locator('#password');
  await expect(email).toBeVisible();
  await expect(password).toBeVisible();
  await expect(email).toHaveValue('');
  await expect(password).toHaveValue('');

  // Preencher credenciais
  await email.fill('admin@tours360.com');
  await password.fill('Admin@Tours360!2024');

  // Submeter
  await Promise.all([
    page.waitForURL(/\/admin(\/?|\/index\.html)?$/),
    page.getByRole('button', { name: 'Entrar' }).click(),
  ]);

  // Verificações pós-login
  await expect(page).toHaveURL(/\/admin(\/?|\/index\.html)?$/);
  const logoutBtn = page.locator('.header .logout-btn');
  await expect(logoutBtn).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function logoutOnce(page) {
  // Aceitar o diálogo de confirmação de logout se aparecer
  page.once('dialog', d => d.accept());

  // Tentar o botão de logout do indicador (sobreposição) primeiro; senão usar o do header
  const overlayLogout = page.locator('#admin-user-indicator .logout-btn');
  if (await overlayLogout.count() > 0 && await overlayLogout.first().isVisible()) {
    await overlayLogout.first().click();
  } else {
    await page.locator('.header .logout-btn').click();
  }

  await page.waitForURL(/\/admin\/login-fixed(\/?|\.html)$/);
}

test.describe('Admin Login Flow @vlex-mu', () => {
  test.setTimeout(60_000);

  test('executa o fluxo de login 3x consecutivas sem falhas', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      console.log(`\n=== Rodada ${i}/3 ===`);
      await loginOnce(page);
      // Smoke da dashboard: alguns elementos-chave
      await expect(page.locator('#totalProperties')).toBeVisible();
      await expect(page.locator('#publishedProperties')).toBeVisible();
      // Logout e confirmar retorno ao login
      await logoutOnce(page);
      // Campos devem permanecer vazios após retorno
      await expect(page.locator('#email')).toHaveValue('');
      await expect(page.locator('#password')).toHaveValue('');
    }
  });
});


import { test, expect } from '@playwright/test';

const BASE_URL = 'https://vlex-mu.vercel.app';

async function loginOnce(page) {
  // Ir para /admin e aguardar redirecionamento ao login
  await page.goto(`${BASE_URL}/admin/`);
  await page.waitForURL(/\/admin\/login-fixed(\/?|\.html)$/);

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
    page.waitForNavigation({ url: `${BASE_URL}/admin/` }),
    page.getByRole('button', { name: 'Entrar' }).click(),
  ]);

  // Verificações pós-login
  await expect(page).toHaveURL(`${BASE_URL}/admin/`);
  await expect(page.getByText('Sair')).toBeVisible();
  await expect(page.getByText('Dashboard')).toBeVisible();
}

async function logoutOnce(page) {
  // Logout pelo botão "Sair" e esperar voltar para login
  await page.getByText('Sair').click();
  await page.waitForURL(/\/admin\/login.*\.html$/);
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


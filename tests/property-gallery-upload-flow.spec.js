// Playwright E2E: validação básica do editor de propriedades (galeria)
// Foco: garantir que os TypeErrors reportados foram eliminados e a UI da galeria carrega

import { test, expect } from '@playwright/test';

// Helper: login via login-fixed.html (modo de teste)
async function ensureLoggedIn(page) {
  await page.goto('http://localhost:8000/admin/login-fixed.html');
  // O login-fixed detecta modo de teste automaticamente; se não, clica Entrar
  try { await page.getByRole('button', { name: 'Entrar' }).click({ timeout: 1000 }); } catch {}
  await page.waitForURL('**/admin/index.html');
}

// Coleta console messages
function collectConsole(page) {
  const messages = [];
  page.on('console', (msg) => messages.push({ type: msg.type(), text: msg.text() }));
  return messages;
}

// ID fornecido pelo usuário
const PROPERTY_ID = '70411de0-e281-4504-9219-c14d4975ba46';

// Erros conhecidos a monitorar
const ERROR_PATTERNS = [
  /TypeError: Cannot read properties of undefined \(reading 'from'\)/i,
  /TypeError: Cannot read properties of undefined \(reading 'storage'\)/i,
];

// Teste principal
test('Editor de propriedade carrega sem TypeErrors (galeria OK)', async ({ page }) => {
  const logs = collectConsole(page);
  await ensureLoggedIn(page);

  await page.goto(`http://localhost:8000/admin/property-editor.html?id=${PROPERTY_ID}`);
  await page.waitForSelector('#galleryGrid', { state: 'attached' });

  // Verificar UI básica da galeria (presença no DOM, mesmo que oculto)
  await expect(page.locator('#uploadArea')).toHaveCount(1);
  await expect(page.locator('#galleryGrid')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '🖼️ Galeria de Imagens' })).toBeVisible();

  // Garantir que nenhum dos TypeErrors ocorreu
  const errorMatches = logs.filter(m => m.type === 'error' || m.type === 'warning')
    .filter(m => ERROR_PATTERNS.some(rx => rx.test(m.text)));
  expect(errorMatches, `Erros inesperados: ${JSON.stringify(errorMatches, null, 2)}`).toHaveLength(0);
});


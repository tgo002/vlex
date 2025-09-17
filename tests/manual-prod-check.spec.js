import { test, expect } from '@playwright/test';

// URL de produção indicada pelo usuário
const PROD_URL = 'https://vlex-git-main-thiago-carvalhos-projects-52b4119d.vercel.app/client/tour/?id=75ee334d-fdef-4289-aeaa-3cb1a54dd884';

function attachCollectors(page) {
  const consoleLogs = [];
  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(text);
    if (msg.type() === 'error') errors.push(text);
  });
  page.on('pageerror', err => errors.push(err.message || String(err)));
  return { consoleLogs, errors };
}

test.describe('Produção  Validação de erros e carregamento', () => {
  test('carrega sem "Unexpected token )" e sem SyntaxError', async ({ page }) => {
    const { errors } = attachCollectors(page);
    await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' });

    // Aguarda um tempo razoável para coleta de erros de parse
    await page.waitForTimeout(8000);

    // Checa se o erro de sintaxe persiste
    const syntaxOrUnexpected = errors.filter(e => /SyntaxError|Unexpected token \)/i.test(e));
    expect(syntaxOrUnexpected).toHaveLength(0);
  });
});


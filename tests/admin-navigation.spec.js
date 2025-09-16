import { test, expect } from '@playwright/test';

const BASE = 'https://virtual-ochre.vercel.app';

test.describe('Admin - Navegação (Voltar e Editar) - validação estrutural segura (sem login)', () => {
  test('site-settings.html contém botão Voltar absoluto para /admin/index.html', async ({ request }) => {
    const resp = await request.get(`${BASE}/admin/site-settings.html`);
    expect(resp.ok()).toBeTruthy();
    const html = await resp.text();
    expect(html).toContain('href="/admin/index.html"');
    expect(html).toContain('class="back-btn"');
  });

  test('publication-manager.html define botão Voltar absoluto para /admin/index.html', async ({ request }) => {
    const resp = await request.get(`${BASE}/admin/publication-manager.html`);
    expect(resp.ok()).toBeTruthy();
    const html = await resp.text();
    expect(html).toContain('href="/admin/index.html"');
  });

  test('publication-manager.html usa link Editar absoluto /admin/property-editor.html?id=', async ({ request }) => {
    const resp = await request.get(`${BASE}/admin/publication-manager.html`);
    expect(resp.ok()).toBeTruthy();
    const html = await resp.text();
    // Verifica no template (no script) que os links são absolutos
    expect(html).toContain('/admin/property-editor.html?id=');
  });
});


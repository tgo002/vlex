import { test, expect } from '@playwright/test';

test('Teste simples de upload - verificar interface', async ({ page }) => {
  // Login
  await page.goto('http://localhost:8000/admin/login-fixed.html');
  await page.fill('#loginEmail', 'admin@tours360.com');
  await page.fill('#loginPassword', 'Admin@Tours360!2024');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/index.html');

  // Ir para editor
  await page.goto('http://localhost:8000/admin/property-editor.html?id=70411de0-e281-4504-9219-c14d4975ba46');
  
  // Aguardar elementos da interface
  await page.waitForSelector('#uploadArea', { state: 'attached' });
  await page.waitForSelector('#galleryGrid', { state: 'attached' });
  
  // Verificar se elementos existem
  const uploadArea = await page.locator('#uploadArea').isVisible();
  const galleryGrid = await page.locator('#galleryGrid').isVisible();
  const imageInput = await page.locator('#imageInput').isVisible();
  
  expect(uploadArea).toBeTruthy();
  expect(galleryGrid).toBeTruthy();
  expect(imageInput).toBeTruthy();
  
  console.log('✅ Interface de upload carregada corretamente');
  
  // Verificar se currentProperty foi definido
  const hasProperty = await page.evaluate(() => {
    return window.currentProperty && window.currentProperty.id;
  });
  
  console.log('currentProperty definido:', hasProperty);
  
  // Simular upload de arquivo pequeno
  const file = { name: 'test.png', mimeType: 'image/png', buffer: Buffer.from('test') };
  await page.setInputFiles('#imageInput', file);
  
  // Aguardar um pouco para ver se há erros
  await page.waitForTimeout(3000);
  
  console.log('✅ Teste de interface concluído');
});

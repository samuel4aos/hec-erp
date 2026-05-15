import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shotDir = path.join(__dirname, 'screenshots');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(shotDir, '01-homepage.png'), fullPage: true });
console.log('✓ 01-homepage');

// Navigate by triggering section changes via React internals
const sections = [
  { id: 'live', name: '02-livestream' },
  { id: 'grace', name: '03-gracegiver' },
  { id: 'prayer', name: '04-prayer' },
  { id: 'academy', name: '05-academy' },
  { id: 'bookstore', name: '06-bookstore' },
];

for (const sec of sections) {
  // Click nav button by finding it in the nav
  try {
    const btn = page.locator(`nav button:has-text("${sec.id}")`);
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(2000);
    } else {
      // Fallback: use all nav buttons and find by section
      const buttons = page.locator('nav button');
      const count = await buttons.count();
      for (let i = 0; i < count; i++) {
        const text = await buttons.nth(i).textContent();
        if (text.toLowerCase().includes(sec.id) || text.toLowerCase().includes(sec.name.replace('02-','').replace('03-','').replace('04-','').replace('05-','').replace('06-',''))) {
          await buttons.nth(i).click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }
    await page.screenshot({ path: path.join(shotDir, `${sec.name}.png`), fullPage: true });
    console.log(`✓ ${sec.name}`);
  } catch (e) {
    console.log(`✗ ${sec.name}: ${e.message}`);
  }
}

// Try login modal
try {
  const loginBtn = page.locator('button:has-text("Login"), button:has-text("Portal")');
  if (await loginBtn.count() > 0) {
    await loginBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(shotDir, '07-login-modal.png'), fullPage: true });
    console.log('✓ 07-login-modal');
  }
} catch (e) {
  console.log(`✗ login: ${e.message}`);
}

await browser.close();
console.log('\nDone!');

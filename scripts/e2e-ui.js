const puppeteer = require('puppeteer');

(async () => {
  const base = 'http://localhost:4200';
  const username = 'mobiletest';
  const password = 'test1234';
  const categoryName = `E2E Cat ${Date.now()}`;
  const description = `E2E Purchase ${Date.now()}`;

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    console.log('Opening login page...');
    await page.goto(`${base}/login`, { waitUntil: 'networkidle2' });

    await page.type('input[placeholder="Digite seu usuário"]', username);
    await page.type('input[placeholder="Digite sua senha"]', password);
    await Promise.all([
      page.click('button.submit-btn'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    console.log('Logged in, navigating to categorias...');

    await page.goto(`${base}/categorias`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder="Nova categoria"]');
    await page.type('input[placeholder="Nova categoria"]', categoryName);
    // ensure input value propagated to Angular
    await page.waitForFunction((name) => {
      const input = document.querySelector('input[placeholder="Nova categoria"]');
      return input && input.value === name;
    }, {}, categoryName);

    await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/categories') && (r.status() === 200 || r.status() === 201), { timeout: 20000 }),
      page.$eval('.add-category button', b => b.click())
    ]);
    // small delay to allow UI to update
    await page.waitForTimeout(500);
    await page.waitForFunction((name) => {
      return Array.from(document.querySelectorAll('.category-item span')).some(el => el.textContent.trim() === name);
    }, {}, categoryName);
    console.log('Category added:', categoryName);

    // Go to lancamentos and add transaction selecting the created category
    await page.goto(`${base}/lancamentos`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[placeholder*="Ex:"]');
    await page.type('input[placeholder*="Ex:"]', description);
    await page.type('input[type="number"]', '12.34');

    // select category by visible text
    const categoryValue = await page.evaluate((name) => {
      const sel = document.querySelector('select');
      if (!sel) return null;
      const opt = Array.from(sel.options).find(o => o.text.trim() === name);
      return opt ? opt.value : null;
    }, categoryName);

    if (!categoryValue) throw new Error('Could not find category option value');
    await page.select('select', categoryValue);

    await Promise.all([
      page.click('.form-card .submit-btn'),
      page.waitForResponse(resp => resp.url().includes('/api/transactions') && resp.status() === 201, { timeout: 10000 })
    ]);

    // Wait for transaction to appear in list
    await page.waitForFunction((desc) => {
      return Array.from(document.querySelectorAll('.transaction-card .description')).some(el => el.textContent.trim() === desc);
    }, {}, description);

    console.log('Transaction added and visible:', description);

    // Verify category badge present for transaction
    const hasBadge = await page.evaluate((desc, cat) => {
      const cards = Array.from(document.querySelectorAll('.transaction-card'));
      for (const c of cards) {
        const d = c.querySelector('.description')?.textContent?.trim();
        if (d === desc) {
          const badge = c.querySelector('.category-badge');
          return badge && badge.textContent.trim() === cat;
        }
      }
      return false;
    }, description, categoryName);

    if (!hasBadge) throw new Error('Transaction badge with category not found');

    console.log('E2E UI test completed successfully');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('E2E script error:', err);
    await browser.close();
    process.exit(2);
  }
})();

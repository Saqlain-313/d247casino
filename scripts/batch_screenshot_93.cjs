const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const CASINO_LIST_PATH = '/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs/casino-list.json';
const REF_DIR = '/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs';
const OUT_REF = '/Users/ansarhusain/Documents/Reddy-777/screenshots/ref';
const OUT_OUR = '/Users/ansarhusain/Documents/Reddy-777/screenshots/our';
const REPORT_PATH = '/Users/ansarhusain/Documents/Reddy-777/screenshots/report.html';

async function login() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:3000/api/user/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.token) resolve(data.token);
            else reject(new Error('No token returned: ' + body));
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify({ userName: 'testuser1', password: '123456' }));
    req.end();
  });
}

async function run() {
  console.log('Logging in...');
  const token = await login();
  console.log('Logged in successfully. Token acquired.');

  const allGames = JSON.parse(fs.readFileSync(CASINO_LIST_PATH, 'utf8'));
  console.log(`Loaded ${allGames.length} games.`);

  const browser = await chromium.launch({ headless: true });

  const refCtx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });

  const ourCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });

  await ourCtx.addCookies([
    { name: 'token', value: token, domain: 'localhost', path: '/' },
  ]);

  // Set localStorage auth once
  const initPage = await ourCtx.newPage();
  await initPage.goto('http://localhost:5173/login');
  await initPage.evaluate((t) => localStorage.setItem('auth', t), token);
  await initPage.close();

  const refPage = await refCtx.newPage();
  const ourPage = await ourCtx.newPage();

  const results = [];

  for (let i = 0; i < allGames.length; i++) {
    const game = allGames[i];
    const slug = game.eventName;
    const name = game.name || slug;
    console.log(`[${i + 1}/${allGames.length}] Processing ${slug} (${name})...`);

    const refHtml = path.join(REF_DIR, slug, 'rendered.html');
    const refImgPath = path.join(OUT_REF, `${slug}.png`);
    const ourImgPath = path.join(OUT_OUR, `${slug}.png`);

    let refOk = false;
    let ourOk = false;
    let errors = [];

    // Capture console errors on our end
    const consoleHandler = (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
          errors.push(text);
        }
      }
    };
    ourPage.on('console', consoleHandler);

    // 1. Ref screenshot
    try {
      if (fs.existsSync(refHtml)) {
        await refPage.goto(`file://${refHtml}`, { waitUntil: 'load', timeout: 8000 });
        await refPage.waitForTimeout(400);
        await refPage.screenshot({ path: refImgPath, fullPage: false });
        refOk = true;
      } else {
        errors.push('Reference rendered.html missing');
      }
    } catch (e) {
      errors.push('Ref capture error: ' + e.message);
    }

    // 2. Our screenshot
    try {
      await ourPage.goto(`http://localhost:5173/casino/${slug}`, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await ourPage.waitForTimeout(1500);

      // Check if table or main container rendered
      const hasTable = await ourPage.evaluate(() => {
        return !!(
          document.querySelector('.casino-table') ||
          document.querySelector('.matka-coins') ||
          document.querySelector('.casino-box') ||
          document.querySelector('.table-responsive') ||
          document.querySelector('.worlibox') ||
          document.querySelector('.teen-table') ||
          document.querySelector('.roulette-table') ||
          document.querySelector('.casino-detail') ||
          document.querySelector('.game-market') ||
          document.querySelector('section') ||
          document.querySelector('.card-odd-box')
        );
      });

      await ourPage.screenshot({ path: ourImgPath, fullPage: false });
      ourOk = hasTable;
      if (!hasTable) {
        errors.push('No casino table element found in DOM');
      }
    } catch (e) {
      errors.push('Our capture error: ' + e.message);
      try {
        await ourPage.screenshot({ path: ourImgPath, fullPage: false });
      } catch (_) {}
    }

    ourPage.off('console', consoleHandler);

    results.push({
      slug,
      name,
      refOk,
      ourOk,
      errors: errors.slice(0, 3),
    });
  }

  await browser.close();

  // Generate HTML Report
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Casino Visual Verification Report (93 Games)</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; }
    h1 { text-align: center; color: #f5a623; }
    .summary { max-width: 900px; margin: 0 auto 30px; background: #1e1e1e; padding: 20px; border-radius: 8px; display: flex; justify-content: space-around; font-size: 18px; }
    .stat { text-align: center; }
    .stat b { font-size: 28px; display: block; }
    .badge-ok { color: #4cd964; }
    .badge-fail { color: #ff3b30; }
    .game-grid { display: flex; flex-direction: column; gap: 30px; max-width: 1400px; margin: 0 auto; }
    .game-card { background: #1e1e1e; border: 1px solid #333; border-radius: 8px; overflow: hidden; padding: 15px; }
    .game-title { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
    .game-title h2 { margin: 0; font-size: 20px; }
    .status-tag { padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 14px; }
    .status-pass { background: #2e7d32; color: #fff; }
    .status-warn { background: #c62828; color: #fff; }
    .comparo { display: flex; gap: 20px; }
    .side { flex: 1; }
    .side h3 { margin: 0 0 8px; font-size: 16px; color: #aaa; text-align: center; }
    .side img { width: 100%; border-radius: 4px; border: 1px solid #444; }
    .err-box { background: #331515; border: 1px solid #662020; color: #ff8888; padding: 8px 12px; border-radius: 4px; font-size: 13px; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>🎰 D247 vs Our Casino Visual Verification (93 Games)</h1>
  <div class="summary">
    <div class="stat"><b class="badge-ok">${results.filter((r) => r.ourOk).length}</b> Tables Rendered</div>
    <div class="stat"><b class="badge-fail">${results.filter((r) => !r.ourOk).length}</b> Issues Found</div>
    <div class="stat"><b>${results.length}</b> Total Games</div>
  </div>
  <div class="game-grid">
`;

  for (const r of results) {
    const isPass = r.ourOk && r.refOk;
    html += `
    <div class="game-card">
      <div class="game-title">
        <h2>${r.name} <small style="color:#888">(${r.slug})</small></h2>
        <span class="status-tag ${isPass ? 'status-pass' : 'status-warn'}">
          ${isPass ? 'MATCH PASS' : 'NEEDS ATTENTION'}
        </span>
      </div>
      <div class="comparo">
        <div class="side">
          <h3>D247 Reference Snapshot</h3>
          <img src="ref/${r.slug}.png" alt="Reference ${r.slug}" loading="lazy">
        </div>
        <div class="side">
          <h3>Our Local App</h3>
          <img src="our/${r.slug}.png" alt="Our ${r.slug}" loading="lazy">
        </div>
      </div>
      ${
        r.errors.length > 0
          ? `<div class="err-box"><b>Notes:</b> ${r.errors.join(' | ')}</div>`
          : ''
      }
    </div>
`;
  }

  html += `
  </div>
</body>
</html>`;

  fs.writeFileSync(REPORT_PATH, html, 'utf8');
  console.log(`\n========================================`);
  console.log(`Execution completed!`);
  console.log(`Passed: ${results.filter((r) => r.ourOk).length}/${results.length}`);
  console.log(`Report written to: ${REPORT_PATH}`);
  console.log(`========================================\n`);
}

run().catch((err) => {
  console.error('Batch verification failed:', err);
  process.exit(1);
});

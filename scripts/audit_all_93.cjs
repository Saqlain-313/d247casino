const fs = require('fs');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { chromium } = require('playwright');

const CASINO_LIST_PATH = '/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs/casino-list.json';
const REF_DIR = '/Users/ansarhusain/Documents/Reddy-777/Casino/d247-vs';

function decryptData2(filePath) {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!raw?.data) return null;
    const ciphertext = Buffer.from(raw.data, 'base64');
    const salt = ciphertext.subarray(8, 16);
    const actualCiphertext = ciphertext.subarray(16);
    const password = Buffer.from('cae7b808-8b1e-4f47-87a5-1a4b6a08030e');
    let hashes = [];
    let prev = Buffer.alloc(0);
    while (Buffer.concat(hashes).length < 48) {
      const md5 = crypto.createHash('md5');
      md5.update(prev);
      md5.update(password);
      md5.update(salt);
      prev = md5.digest();
      hashes.push(prev);
    }
    const keyIv = Buffer.concat(hashes);
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyIv.subarray(0, 32), keyIv.subarray(32, 48));
    let dec = decipher.update(actualCiphertext);
    dec = Buffer.concat([dec, decipher.final()]);
    return JSON.parse(dec.toString('utf8'));
  } catch (e) {
    return null;
  }
}

function fetchJson(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function login() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(JSON.parse(body).token));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ userName: 'testuser1', password: '123456' }));
    req.end();
  });
}

async function run() {
  const token = await login();
  const games = JSON.parse(fs.readFileSync(CASINO_LIST_PATH, 'utf8'));

  const browser = await chromium.launch({ headless: true });
  const ourCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ourCtx.addCookies([{ name: 'token', value: token, domain: 'localhost', path: '/' }]);
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5174';
  const initPage = await ourCtx.newPage();
  await initPage.goto(`${clientUrl}/login`);
  await initPage.evaluate((t) => localStorage.setItem('auth', t), token);
  await initPage.close();

  const page = await ourCtx.newPage();
  const report = [];

  for (let i = 0; i < games.length; i++) {
    const g = games[i];
    const slug = g.eventName;

    // Inspect reference data2.html
    const refData2 = decryptData2(path.join(REF_DIR, slug, 'd247.com/api/front/casino/data2.html'));
    const refD = refData2?.data || {};
    const refSubs = Array.isArray(refD.sub) ? refD.sub : [];

    // Inspect live backend response
    const apiRes = await fetchJson(`http://localhost:3000/api/casino-betting-data?eventName=${slug}`);
    const liveD = apiRes?.data?.data || {};
    const liveSubs = Array.isArray(liveD.sub) ? liveD.sub : [];

    // Visit our page and inspect DOM
    let domStats = { error: null };
    try {
      await page.goto(`${clientUrl}/casino/${slug}`, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(1000);
      domStats = await page.evaluate(() => {
        const videoBox = document.querySelector('.video-box-container, .casino-video-box, .video-overlay-cards')?.parentElement;
        const videoRect = document.querySelector('.casino-video-box, .video-box-container')?.getBoundingClientRect();
        const centerRect = document.querySelector('.center-container, .ml-0')?.getBoundingClientRect();
        const allOddsSpans = Array.from(document.querySelectorAll('.casino-odd, .market-odd, td, button, .odd, span')).filter(el => el.children.length === 0);
        const dashCount = allOddsSpans.filter(el => el.textContent.trim() === '-').length;
        const numericOddsCount = allOddsSpans.filter(el => /^\d+(\.\d+)?$/.test(el.textContent.trim()) && Number(el.textContent.trim()) > 1).length;
        const lockIcons = document.querySelectorAll('.fa-lock, [data-icon="lock"], svg.lucide-lock').length;
        const flipCards = document.querySelectorAll('.flip-card, .card-container, img[src*="cards"]').length;
        const noMarketText = document.body.innerText.includes('There are no market available');
        const rulesRows = document.querySelectorAll('.rules-container tr, .sidebar-box tr').length;
        return {
          videoW: Math.round(videoRect?.width || 0),
          videoH: Math.round(videoRect?.height || 0),
          centerW: Math.round(centerRect?.width || 0),
          dashCount,
          numericOddsCount,
          lockIcons,
          flipCards,
          noMarketText,
          rulesRows,
        };
      });
    } catch (e) {
      domStats = { error: e.message };
    }

    const row = {
      idx: i + 1,
      slug,
      cat: g.category,
      refSubCount: refSubs.length,
      refCard: refD.card || refD.t1?.card || '',
      liveSubCount: liveSubs.length,
      liveCard: liveD.card || '',
      liveSampleSub: liveSubs[0] ? { sid: liveSubs[0].sid, nat: liveSubs[0].nat, b: liveSubs[0].b, l: liveSubs[0].l, gstatus: liveSubs[0].gstatus } : null,
      ...domStats,
    };
    report.push(row);
    console.log(`[${i+1}/93] ${slug} | refSub:${row.refSubCount} liveSub:${row.liveSubCount} | odds:${row.numericOddsCount} dash:${row.dashCount} locks:${row.lockIcons} | vid:${row.videoW}x${row.videoH}/${row.centerW} | cards:${row.flipCards}${row.noMarketText ? ' NO_MARKET!' : ''}${row.error ? ' ERR:'+row.error : ''}`);
  }

  await browser.close();
  fs.writeFileSync('/Users/ansarhusain/Documents/Reddy-777/screenshots/audit_93.json', JSON.stringify(report, null, 2));
  console.log('Saved audit_93.json');
}

run().catch(console.error);

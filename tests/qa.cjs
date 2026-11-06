/**
 * Site QA for Website 14 (Hair Transplant & Trichology Clinic).
 * Usage: node qa.cjs <siteDir> [--quick]
 * Turns the client checklist and the "past mistakes" list into checks. Exit code 1 if anything fails.
 *
 * Conventions the site must follow (see BUILD conventions in the brief):
 *   header: #siteHeader; theme toggle [data-theme-toggle]; RTL toggle [data-dir-toggle]; navbar CTA [data-nav-cta]
 *   logo link: a.brand (href index.html)          forms: form[data-validate] with inputs named name/email/phone
 *   blog cards: .blog-card with .author-name and img.author-photo; covers img.blog-cover
 *   testimonials: .testimonial with an img
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('/private/tmp/claude-501/-Users-selvamm-Desktop-15WebSites-Project-7-Error-Cleared-Webpage/511983cb-1d28-48e6-91ce-fdd565d95b6d/scratchpad/entwork/ctools/node_modules/playwright');

const SITE = path.resolve(process.argv[2] || '.');
const QUICK = process.argv.includes('--quick');
const PAGES = ['index.html', 'home-2.html', 'about.html', 'treatments.html', 'doctors.html', 'results.html', 'blog.html', 'contact.html'];
const NAV = ['Home', 'About', 'Treatments', 'Doctors', 'Results', 'Blog', 'Contact'];
const WIDTHS = QUICK ? [360, 768, 1024, 1440] : [360, 390, 768, 900, 1024, 1180, 1280, 1440];
const fails = [];
const warn = [];
const fail = (page, msg) => fails.push(`${page}: ${msg}`);

function luminance([r, g, b]) {
  const c = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

(async () => {
  for (const p of PAGES) if (!fs.existsSync(path.join(SITE, p))) fail(p, 'page missing');
  if (!fs.existsSync(path.join(SITE, 'favicon.svg'))) fail('site', 'favicon.svg missing');

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const imageUse = new Map(); // src -> [pages]
  const allAuthors = [];

  for (const page of PAGES) {
    if (!fs.existsSync(path.join(SITE, page))) continue;
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    p.on('requestfailed', r => { if (r.url().startsWith('file:')) errors.push('missing file ' + r.url()); });
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.goto('file://' + path.join(SITE, page), { waitUntil: 'load' });
    await p.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important} html{scroll-behavior:auto!important}' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 20)); } window.scrollTo(0, 0); });
    await p.waitForTimeout(400);

    // ---------- static structure ----------
    const s = await p.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
      const h1 = document.querySelectorAll('h1').length;
      const brand = [...document.querySelectorAll('a.brand')].map(a => a.getAttribute('href'));
      const navLinks = [...document.querySelectorAll('#siteHeader nav a, #siteHeader nav button')].filter(vis).map(a => a.textContent.trim().replace(/\s+/g, ' '));
      const cta = [...document.querySelectorAll('[data-nav-cta]')].map(a => a.getAttribute('href'));
      const imgs = [...document.images].map(i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt'), ok: i.complete && i.naturalWidth > 0, wh: i.hasAttribute('width') && i.hasAttribute('height'), lazy: i.loading }));
      const bgs = [...document.querySelectorAll('*')].map(e => getComputedStyle(e).backgroundImage).filter(b => b && b.includes('url(')).map(b => (b.match(/url\(["']?([^"')]+)/) || [])[1]).filter(Boolean);
      const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
      const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
      const authors = [...document.querySelectorAll('.blog-card')].map(c => ({ name: (c.querySelector('.author-name') || {}).textContent?.trim(), photo: c.querySelector('img.author-photo')?.getAttribute('src'), cover: c.querySelector('img.blog-cover')?.getAttribute('src') }));
      const testimonials = [...document.querySelectorAll('.testimonial')].map(t => !!t.querySelector('img'));
      const forms = [...document.querySelectorAll('form')].map(f => ({ validate: f.hasAttribute('data-validate'), novalidate: f.noValidate, fields: [...f.elements].map(e => e.name).filter(Boolean) }));
      const headings = [...document.querySelectorAll('h1, h2')].filter(vis).map(h => { const rg = document.createRange(); rg.selectNodeContents(h); const rects = [...rg.getClientRects()].filter(r => r.width > 1); const lines = {}; rects.forEach(r => { const k = Math.round(r.top); lines[k] = (lines[k] || 0) + r.width; }); const ws = Object.values(lines); return { text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), lines: ws.length, last: ws[ws.length - 1], max: Math.max(...ws), lastWords: h.textContent.trim().split(/\s+/).length }; });
      return { h1, brand, navLinks, cta, imgs, bgs, links, ids, authors, testimonials, forms, headings, map: !!document.querySelector('iframe[src*="map"]'), faq: !!document.querySelector('#faq, [data-faq], .faq'), errorsInit: 0 };
    });
    if (s.h1 !== 1) fail(page, `expected 1 h1, found ${s.h1}`);
    if (!s.brand.length || s.brand.some(h => h !== 'index.html')) fail(page, `logo/brand must link to index.html (found ${JSON.stringify(s.brand)})`);
    if (!s.cta.length || s.cta.some(h => !/^contact\.html(#.+)?$/.test(h || ''))) fail(page, `navbar CTA must go to contact.html (found ${JSON.stringify(s.cta)})`);
    const navTop = s.navLinks.map(t => t.replace(/[▾⌄]/g, '').trim()).filter(t => NAV.includes(t));
    if (navTop.join('|') !== NAV.join('|')) fail(page, `nav order should be ${NAV.join(' · ')}, found ${navTop.join(' · ')}`);
    s.imgs.forEach(i => {
      if (!i.ok) fail(page, `image did not load: ${i.src}`);
      if (i.alt === null) fail(page, `image without alt: ${i.src}`);
      if (!i.wh && !/\.svg$/.test(i.src || '')) fail(page, `image without width/height: ${i.src}`);
      if (!/\.svg$/.test(i.src || '')) { const k = i.src.replace(/-(160|800|1600)\.webp$/, ''); (imageUse.get(k) || imageUse.set(k, []).get(k)).push(page + ':img'); }
    });
    s.bgs.forEach(b => { if (/\.svg/.test(b)) return; const k = b.replace(/^.*\/images\//, 'images/').replace(/-(160|800|1600)\.webp$/, ''); (imageUse.get(k) || imageUse.set(k, []).get(k)).push(page + ':bg'); });
    s.testimonials.forEach((ok, i) => { if (!ok) fail(page, `testimonial #${i + 1} has no photo`); });
    s.forms.forEach((f, i) => { if (!f.validate || !f.novalidate) fail(page, `form #${i + 1} must have data-validate and novalidate`); });
    s.headings.forEach(h => { if (h.lines > 1 && h.lastWords > 3 && h.last < h.max * 0.25) fail(page, `heading has an orphan last line at 1440: "${h.text}"`); });
    if (page === 'blog.html') {
      allAuthors.push(...s.authors);
      if (s.authors.length < 6) fail(page, `expected at least 6 blog cards, found ${s.authors.length}`);
      if (s.authors.some(a => !a.name || !a.photo || !a.cover)) fail(page, 'every .blog-card needs .author-name, img.author-photo and img.blog-cover');
    }
    if (page === 'contact.html') {
      if (!s.map) fail(page, 'embedded map iframe missing');
      if (!s.faq) fail(page, 'FAQ section missing (#faq)');
      if (!s.ids.includes('book')) fail(page, '#book (visit booking form section) missing');
    }
    // internal links
    for (const href of s.links) {
      if (!href || /^(https?:|mailto:|tel:|javascript:)/.test(href)) continue;
      const [file, hash] = href.split('#');
      const target = file || page;
      if (!fs.existsSync(path.join(SITE, target))) { fail(page, `broken link ${href}`); continue; }
      if (hash) {
        const html = fs.readFileSync(path.join(SITE, target), 'utf8');
        if (!new RegExp(`id=["']${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html)) fail(page, `link ${href}: id "${hash}" not found in ${target}`);
      }
    }

    // ---------- per width / theme / direction ----------
    const combos = [];
    for (const w of WIDTHS) combos.push([w, 'light', 'ltr']);
    for (const w of [360, 1024, 1440]) { combos.push([w, 'dark', 'ltr']); combos.push([w, 'light', 'rtl']); }
    for (const [w, theme, dir] of combos) {
      await p.setViewportSize({ width: w, height: 900 });
      await p.evaluate(([t, d]) => { document.documentElement.setAttribute('data-theme', t); document.documentElement.setAttribute('dir', d); window.dispatchEvent(new Event('resize')); }, [theme, dir]);
      await p.waitForTimeout(120);
      const tag = `${w}px ${theme} ${dir}`;
      const r = await p.evaluate(() => {
        const vis = el => { const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el); return rc.width > 0 && rc.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; };
        const out = {};
        out.hscroll = document.documentElement.scrollWidth - window.innerWidth;
        out.controls = ['[data-theme-toggle]', '[data-dir-toggle]', '[data-nav-cta]'].map(sel => [...document.querySelectorAll(sel)].filter(vis).length);
        const ctl = ['[data-theme-toggle]', '[data-dir-toggle]', '[data-nav-cta]'].map(sel => [...document.querySelectorAll(sel)].find(e => vis(e) && e.closest('#siteHeader') && !e.closest('[data-mobile-menu]')));
        out.ctlDims = ctl.filter(Boolean).map(e => { const rc = e.getBoundingClientRect(); return [Math.round(rc.height), getComputedStyle(e).borderTopLeftRadius]; });
        // card-row alignment: grid/flex-row containers whose visible children share a structure
        const bad = [];
        const leafSel = 'h2,h3,h4,p,ul,ol,dl,blockquote,.badge,.meta,.btn,a.link,time,figcaption,.price';
        const sig = el => [...el.children].map(c => c.tagName + '.' + (c.className || '').toString().split(/\s+/)[0]).join(',');
        document.querySelectorAll('main *').forEach(g => {
          const cs = getComputedStyle(g);
          if (!(cs.display === 'grid' || (cs.display === 'flex' && cs.flexDirection === 'row' && cs.flexWrap !== 'nowrap'))) return;
          const items = [...g.children].filter(c => vis(c) && c.getBoundingClientRect().width > 140);
          if (items.length < 2 || items.length > 12) return;
          const s0 = sig(items[0]); if (!s0 || !items.every(i => sig(i) === s0)) return;
          const rows = {}; items.forEach(i => { const t = Math.round(i.getBoundingClientRect().top); (rows[t] ||= []).push(i); });
          for (const row of Object.values(rows)) {
            if (row.length < 2) continue;
            const L = row.map(i => [...i.querySelectorAll(leafSel)].filter(vis).filter(l => !l.parentElement.closest(leafSel) || l.parentElement === i).map(l => Math.round(l.getBoundingClientRect().top - i.getBoundingClientRect().top)));
            if (!L.every(x => x.length === L[0].length)) continue;
            for (let k = 0; k < L[0].length; k++) { const v = L.map(x => x[k]); if (Math.max(...v) - Math.min(...v) > 2) { const first = row[0].querySelector('h2,h3,h4'); bad.push(`row starting "${(first ? first.textContent : '').trim().slice(0, 30)}": element ${k + 1} tops ${v.join('/')}`); break; } }
          }
        });
        out.align = bad;
        // contrast of visible text (skip text over images / gradients)
        const low = [];
        const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const a = m[1].split(',').map(Number); return a.length === 4 ? a : [...a, 1]; };
        const bgOf = el => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c && c[3] > 0.95) return c.slice(0, 3); } return [255, 255, 255]; };
        document.querySelectorAll('main p, main h1, main h2, main h3, main li, main a, main span, main label, footer p, footer a, footer li, header a').forEach(el => {
          if (!vis(el) || !el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
          if (el.closest('[aria-hidden="true"], .sr-only, .visually-hidden')) return;
          const bg = bgOf(el); if (!bg) return;
          const cs = getComputedStyle(el); const fg = parse(cs.color); if (!fg) return;
          const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
          const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
          const lum = c => { const v = c.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
          const fgc = fg[3] < 1 ? fg.slice(0, 3).map((x, i) => x * fg[3] + bg[i] * (1 - fg[3])) : fg.slice(0, 3);
          const [a, b] = [lum(fgc), lum(bg)].sort((x, y) => y - x); const cr = (a + 0.05) / (b + 0.05);
          if (cr < need) low.push(`"${el.textContent.trim().slice(0, 30)}" ${cr.toFixed(2)} < ${need}`);
        });
        out.contrast = [...new Set(low)].slice(0, 8);
        return out;
      });
      if (r.hscroll > 1) fail(page, `${tag}: horizontal scroll ${r.hscroll}px`);
      r.controls.forEach((n, i) => { if (n !== 1) fail(page, `${tag}: ${['theme toggle', 'RTL toggle', 'navbar CTA'][i]} visible ${n} times (must be exactly 1)`); });
      if (w >= 1024 && r.ctlDims.length === 3) { const hs = new Set(r.ctlDims.map(d => d[0])), rs = new Set(r.ctlDims.map(d => d[1])); if (hs.size > 1 || rs.size > 1) fail(page, `${tag}: theme/RTL/CTA heights or radii differ ${JSON.stringify(r.ctlDims)}`); }
      r.align.forEach(a => fail(page, `${tag}: card text not level: ${a}`));
      r.contrast.forEach(c => fail(page, `${tag}: low contrast ${c}`));
    }
    errors.forEach(e => fail(page, `console/page error: ${e}`));
    await p.close();
  }

  // site-wide uniqueness
  for (const [img, uses] of imageUse) if (uses.length > 1) fail('site', `image used ${uses.length} times: ${img} (${uses.join(', ')})`);
  const names = allAuthors.map(a => a.name), photos = allAuthors.map(a => a.photo), covers = allAuthors.map(a => a.cover);
  [['author name', names], ['author photo', photos], ['blog cover', covers]].forEach(([k, arr]) => { const d = arr.filter((x, i) => x && arr.indexOf(x) !== i); if (d.length) fail('blog.html', `duplicate ${k}: ${[...new Set(d)].join(', ')}`); });

  // forms behaviour (contact booking form)
  if (fs.existsSync(path.join(SITE, 'contact.html'))) {
    const p = await ctx.newPage();
    await p.goto('file://' + path.join(SITE, 'contact.html'), { waitUntil: 'load' });
    const form = p.locator('#book form[data-validate], form#bookForm, #book form').first();
    const has = await form.count();
    if (!has) fail('contact.html', 'booking form not found in #book');
    else {
      const cases = [['name', 'A', false], ['name', 'John3', false], ['name', 'Mary Evans', true], ['email', 'mary.example.com', false], ['email', 'mary@', false], ['email', 'mary@example.com', true], ['phone', '98765abc', false], ['phone', '9876543210', true]];
      for (const [field, value, valid] of cases) {
        const input = form.locator(`[name="${field}"]`);
        if (!(await input.count())) { fail('contact.html', `booking form has no "${field}" field`); continue; }
        await input.fill(value); await input.blur();
        await form.locator('[type="submit"]').first().click();
        await p.waitForTimeout(80);
        const invalid = await input.evaluate(el => el.getAttribute('aria-invalid') === 'true');
        if (invalid === valid) fail('contact.html', `${field} "${value}" should be ${valid ? 'accepted' : 'rejected'} (aria-invalid=${invalid})`);
      }
    }
    await p.close();
  }

  await browser.close();
  console.log(fails.length ? `FAIL: ${fails.length} problem(s)` : 'PASS: all checks');
  fails.forEach(f => console.log(' - ' + f));
  warn.forEach(f => console.log(' ~ ' + f));
  process.exit(fails.length ? 1 : 0);
})();


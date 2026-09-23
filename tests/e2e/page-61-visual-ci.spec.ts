import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const runtimeArtifact = path.resolve(
  'reports/sharklock-evidence/page-61/runtime-219-254-1440x1024.png',
);

test('captures canonical Page 61 / node 219:254', async ({ page }) => {
  await page.context().addCookies([
    { name: 'hydrorivers.theme', value: 'dark', domain: '127.0.0.1', path: '/' },
  ]);

  const login = await page.request.post('/api/mock-mode/login-as', {
    data: { userId: 'u-shipper-1' },
  });
  expect(login.status()).toBe(200);

  await page.goto('/pt-BR/minhas-cargas?visualFixture=page61-219-254', {
    waitUntil: 'networkidle',
  });
  await expect(page.getByTestId('m01-desktop-foundation')).toBeVisible();
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);

  const geometry = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="m01-desktop-foundation"]');
    if (!root) return null;
    const rect = (el) => {
      if (!(el instanceof Element)) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80),
        x: Math.round(r.x * 100) / 100,
        y: Math.round(r.y * 100) / 100,
        width: Math.round(r.width * 100) / 100,
        height: Math.round(r.height * 100) / 100,
        background: cs.backgroundColor,
        color: cs.color,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight
      };
    };
    const aside = root.querySelector('aside');
    const header = root.querySelector('header');
    const sections = root.querySelectorAll(':scope > section');
    const master = sections[0];
    const detail = sections[1];
    const navLinks = aside ? [...aside.querySelectorAll('nav a')].map(rect) : [];
    const navGroups = aside ? [...aside.querySelectorAll('nav small')].map(rect) : [];
    const asideDirect = aside ? [...aside.children].map(rect) : [];
    const masterDirect = master ? [...master.children].map(rect) : [];
    const map = detail?.querySelector(':scope > div');
    const mapDirect = map ? [...map.children].map(rect) : [];
    const svg = map?.querySelector('svg');
    const svgPaths = svg ? [...svg.querySelectorAll('path')].map((el) => {
      const r = el.getBoundingClientRect();
      let bbox = null;
      try {
        const b = el.getBBox();
        bbox = { x: b.x, y: b.y, width: b.width, height: b.height };
      } catch {}
      return {
        d: el.getAttribute('d'),
        x: Math.round(r.x * 100) / 100,
        y: Math.round(r.y * 100) / 100,
        width: Math.round(r.width * 100) / 100,
        height: Math.round(r.height * 100) / 100,
        bbox
      };
    }) : [];
    return { aside: rect(aside), header: rect(header), asideDirect, navGroups, navLinks, master: rect(master), masterDirect, detail: rect(detail), map: rect(map), mapDirect, svgPaths };
  });
  console.log('PAGE61_GEOMETRY', JSON.stringify(geometry));

  await mkdir(path.dirname(runtimeArtifact), { recursive: true });
  await page.screenshot({
    path: runtimeArtifact,
    animations: 'disabled',
    caret: 'hide',
  });
});

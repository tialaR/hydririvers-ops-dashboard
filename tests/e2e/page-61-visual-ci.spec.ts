import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const runtimeArtifact = path.resolve(
  'reports/sharklock-evidence/page-61/runtime-219-254-1440x1024.png',
);


function assertNear(actual: number, expected: number, tolerance = 2): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

async function expectGeometry(
  locator: import('@playwright/test').Locator,
  expected: { x: number; y: number; width: number; height: number },
  tolerance = 2,
) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  assertNear(box.x, expected.x, tolerance);
  assertNear(box.y, expected.y, tolerance);
  assertNear(box.width, expected.width, tolerance);
  assertNear(box.height, expected.height, tolerance);
}

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

  const root = page.getByTestId('m01-desktop-foundation');
  await expect(root).toBeVisible();
  await expect(page.locator('[data-nextjs-dialog]')).toHaveCount(0);

  // Gate A: structural contract. These assertions are intentionally independent
  // from screenshot similarity so a missing/shifted region can never be hidden
  // by a favorable global diff score.
  await expectGeometry(root, { x: 0, y: 0, width: 1440, height: 1024 });
  await expectGeometry(page.getByTestId('page61-sidebar'), { x: 0, y: 0, width: 272, height: 1024 });
  await expectGeometry(page.getByTestId('page61-header'), { x: 272, y: 0, width: 1168, height: 56 });
  await expectGeometry(page.getByTestId('page61-master'), { x: 272, y: 56, width: 400, height: 968 });
  await expectGeometry(page.getByTestId('page61-detail'), { x: 672, y: 56, width: 768, height: 968 });
  await expectGeometry(page.getByTestId('page61-map-surface'), { x: 672, y: 56, width: 768, height: 448 });

  const cards = page.getByTestId('page61-shipment-card');
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toBeVisible();
  const firstCardBox = await cards.first().boundingBox();
  expect(firstCardBox).not.toBeNull();
  if (firstCardBox) {
    assertNear(firstCardBox.width, 386, 2);
    expect(firstCardBox.height).toBeGreaterThanOrEqual(230);
  }

  const tabs = page.getByTestId('page61-detail-tabs');
  await expect(tabs).toBeVisible();
  await expect(tabs.locator(':scope > button, :scope > a')).toHaveCount(5);

  const attention = page.getByTestId('page61-attention-panel');
  await expect(attention).toBeVisible();
  await expect(attention.getByRole('link')).toHaveCount(1);

  const mapControls = page.getByTestId('page61-map-controls');
  await expect(mapControls).toBeVisible();
  await expect(mapControls.getByRole('button')).toHaveCount(3);

  const geometry = await page.evaluate(() => {
    const rootEl = document.querySelector('[data-testid="m01-desktop-foundation"]');
    if (!rootEl) return null;
    const rect = (el: Element | null) => {
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
    const aside = rootEl.querySelector('aside');
    const header = rootEl.querySelector('header');
    const sections = rootEl.querySelectorAll(':scope > section');
    const master = sections[0];
    const detail = sections[1];
    const navLinks = aside ? [...aside.querySelectorAll('nav a')].map(rect) : [];
    const navGroups = aside ? [...aside.querySelectorAll('nav small')].map(rect) : [];
    const asideDirect = aside ? [...aside.children].map(rect) : [];
    const masterDirect = master ? [...master.children].map(rect) : [];
    const map = detail?.querySelector(':scope > div');
    const mapDirect = map ? [...map.children].map(rect) : [];
    const svg = map?.querySelector('svg');
    const svgPaths = svg ? [...svg.querySelectorAll('path')].map((el: SVGPathElement) => {
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

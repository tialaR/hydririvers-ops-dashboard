import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const adminChromePath = join(repoRoot, 'src', 'shared', 'layout', 'admin-chrome', 'admin-chrome.tsx');
const globalsPath = join(repoRoot, 'src', 'app', 'globals.scss');

describe('admin chrome desktop header structure', () => {
  const adminSource = readFileSync(adminChromePath, 'utf8');
  const globalsSource = readFileSync(globalsPath, 'utf8');

  it('liga scroll da janela e do conteúdo ao estado scrolled do header (passivo, sem medir altura)', () => {
    expect(adminSource).toContain('dashboardScrollRef');
    expect(adminSource).not.toContain('shellRef');
    expect(adminSource).not.toContain('dashboardTopbarRef');
    expect(adminSource).toContain('isDashboardHeaderScrolled');
    expect(adminSource).toContain('scrollTop > 8');
    expect(adminSource).toContain('window.scrollY > 8');
    expect(adminSource).toContain("className={`hx-topbar hr-topbar${isDashboardHeaderScrolled ? ' hx-topbar--scrolled' : ''}`}");
    expect(adminSource).toContain("data-scrolled={isDashboardHeaderScrolled ? 'true' : 'false'}");
    expect(adminSource).toMatch(/ref=\{dashboardScrollRef\}[\s\S]*hr-dashboard-content-root/);
    expect(adminSource).toContain('hr-dashboard-scroll');
    expect(adminSource).not.toContain('ResizeObserver');
    expect(adminSource).toContain('{ passive: true }');
  });

  it('envolve nome e papel do perfil em hx-profile-text', () => {
    expect(adminSource).toContain('className="hx-profile-text"');
    expect(adminSource).toMatch(/<div className="hx-profile-text">[\s\S]*<strong/);
    expect(adminSource).toMatch(/<strong[\s\S]*<\/strong>[\s\S]*<small>/);
  });

  it('usa slot de scroll sob o header com flex + .hr-dashboard-scroll para glass real', () => {
    expect(globalsSource).toContain('.hr-dashboard-scroll');
    expect(globalsSource).toMatch(/\.hr-dashboard-scroll[\s\S]*overflow-y:\s*auto/);
    expect(globalsSource).toContain('--app-header-height-desktop:');
    expect(globalsSource).toContain('max-height: var(--hr-topbar-height, 96px) !important;');
  });

  it('define glass e blur mais forte quando scrolled', () => {
    expect(globalsSource).toContain('.hx-topbar.hr-topbar.hx-topbar--scrolled');
    expect(globalsSource).toContain(".hx-topbar.hr-topbar[data-scrolled='true']");
    expect(globalsSource).toMatch(/\.hx-topbar\.hr-topbar\.hx-topbar--scrolled[\s\S]*backdrop-filter:\s*blur\(24px\)/);
  });

  it('mantém busca com largura máxima responsiva e título com min-width 0', () => {
    expect(globalsSource).toContain('.hx-title-block');
    expect(globalsSource).toMatch(/\.hx-title-block\s*\{[^}]*min-width:\s*0/s);
    expect(globalsSource).toMatch(/\.hx-top-search\s*\{[^}]*max-width:\s*clamp\(/s);
    expect(globalsSource).toContain('.hx-title-block__heading-inner');
    expect(globalsSource).toContain('.hx-title-block__kicker');
  });

  it('mantém coluna flex com gap entre nome e papel', () => {
    expect(globalsSource).toMatch(/\.hx-profile-text\s*\{[^}]*flex-direction:\s*column/s);
    expect(globalsSource).toMatch(/\.hx-profile-text\s*\{[^}]*gap:\s*0\.28rem/s);
  });
});

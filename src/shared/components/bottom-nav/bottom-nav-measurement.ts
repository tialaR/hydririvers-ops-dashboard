/** DOM measurement helpers for unified active pill width (no querySelector). */

export function parseBottomNavCssLengthPx(value: string, rootFontSize: number): number {
  return parseCssLengthPx(value, rootFontSize);
}

function findChildByDataAttr(
  parent: HTMLElement,
  attr: string,
  value: string,
): HTMLElement | null {
  for (const child of parent.children) {
    if (child instanceof HTMLElement && child.getAttribute(attr) === value) {
      return child;
    }
  }

  return null;
}

function parseCssLengthPx(value: string, rootFontSize: number): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  if (trimmed.endsWith('rem')) {
    return parseFloat(trimmed) * rootFontSize;
  }

  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }

  const numeric = parseFloat(trimmed);
  return Number.isFinite(numeric) ? numeric : 0;
}

function measureIntrinsicInlineWidth(element: HTMLElement): number {
  const style = getComputedStyle(element);

  if (style.display !== 'none' && style.overflow !== 'hidden') {
    const unconstrained = element.scrollWidth;
    const rendered = element.getBoundingClientRect().width;

    if (unconstrained > rendered + 0.5) {
      return unconstrained;
    }

    if (unconstrained > 0) {
      return unconstrained;
    }
  }

  const probe = element.cloneNode(true) as HTMLElement;
  probe.style.cssText =
    'position:absolute;visibility:hidden;display:block;width:max-content;max-width:none;min-width:0;overflow:visible;white-space:nowrap;pointer-events:none;';
  element.parentElement?.appendChild(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();

  return width;
}

function measureBottomNavLabelWidth(label: HTMLElement): number {
  const children = Array.from(label.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );

  if (children.length === 0) {
    return measureIntrinsicInlineWidth(label);
  }

  const fullLabel = children[0];
  const compactLabel = children[1];
  const useCompact = getComputedStyle(fullLabel).display === 'none';
  const activeLabel = useCompact && compactLabel ? compactLabel : fullLabel;

  return measureIntrinsicInlineWidth(activeLabel);
}

export function measureBottomNavItemContentWidth(item: HTMLElement): number {
  const label = findChildByDataAttr(item, 'data-bottom-nav-label-measure', 'true');
  const icon = findChildByDataAttr(item, 'data-bottom-nav-icon-variant', 'outlined');
  const itemStyle = getComputedStyle(item);
  const paddingX =
    parseFloat(itemStyle.paddingLeft) + parseFloat(itemStyle.paddingRight);
  const iconWidth = icon?.getBoundingClientRect().width ?? 0;
  const labelWidth = label ? measureBottomNavLabelWidth(label) : 0;

  return Math.max(iconWidth, labelWidth) + paddingX;
}

export function measureBottomNavSelectionWidth(
  nav: HTMLElement,
  items: Iterable<HTMLElement>,
): number {
  const navStyle = getComputedStyle(nav);
  const rootFontSize = parseFloat(navStyle.fontSize) || 16;
  const fallback = parseCssLengthPx(
    navStyle.getPropertyValue('--bn-active-pill-width-fallback'),
    rootFontSize,
  );
  const innerPadding = parseCssLengthPx(
    navStyle.getPropertyValue('--bn-active-pill-inner-padding'),
    rootFontSize,
  );

  let maxContentWidth = 0;

  for (const item of items) {
    maxContentWidth = Math.max(maxContentWidth, measureBottomNavItemContentWidth(item));
  }

  if (maxContentWidth <= 0) {
    return fallback;
  }

  return maxContentWidth + innerPadding;
}

export function readBottomNavViewportAvailable(nav: HTMLElement): number {
  const navStyle = getComputedStyle(nav);
  const rootFontSize = parseFloat(navStyle.fontSize) || 16;
  const marginInline = parseCssLengthPx(
    navStyle.getPropertyValue('--menu-margin-inline'),
    rootFontSize,
  );

  if (typeof window === 'undefined') {
    return 0;
  }

  return Math.max(0, window.innerWidth - marginInline * 2);
}

export function computeBottomNavContainerMinWidth(
  nav: HTMLElement,
  selectionWidth: number,
  itemCount: number,
): number {
  if (selectionWidth <= 0 || itemCount <= 0) {
    return 0;
  }

  const navStyle = getComputedStyle(nav);
  const rootFontSize = parseFloat(navStyle.fontSize) || 16;
  const paddingInline =
    parseFloat(navStyle.paddingLeft) + parseFloat(navStyle.paddingRight);
  const borderInline =
    parseFloat(navStyle.borderLeftWidth) + parseFloat(navStyle.borderRightWidth);
  const gap =
    parseFloat(navStyle.columnGap) ||
    parseFloat(navStyle.gap) ||
    parseCssLengthPx(navStyle.getPropertyValue('--bn-menu-gap'), rootFontSize);
  const itemGaps = Math.max(0, itemCount - 1) * gap;
  const centeringMin = itemCount * selectionWidth + itemGaps + paddingInline + borderInline;
  const viewportAvailable = readBottomNavViewportAvailable(nav);

  if (viewportAvailable <= 0) {
    return centeringMin;
  }

  return Math.min(centeringMin, viewportAvailable);
}

export function computeBottomNavActiveX(
  nav: HTMLElement,
  activeItem: HTMLElement,
  selectionWidth: number,
): number {
  const navStyle = getComputedStyle(nav);
  const borderLeft = parseFloat(navStyle.borderLeftWidth);
  const borderRight = parseFloat(navStyle.borderRightWidth);
  const navRect = nav.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();
  const trackLeft = navRect.left + borderLeft;
  const trackWidth = navRect.width - borderLeft - borderRight;
  const itemCenterX = itemRect.left + itemRect.width / 2 - trackLeft;
  const centered = itemCenterX - selectionWidth / 2;
  const maxX = Math.max(0, trackWidth - selectionWidth);

  return Math.max(0, Math.min(maxX, centered));
}

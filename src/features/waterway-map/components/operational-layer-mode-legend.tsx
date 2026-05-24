'use client';

import { useTranslations } from 'next-intl';

import { OPERATIONAL_MODE_LEGEND } from '../constants/hydroway-operational-layer-legend';
import type { HydrowayOperationalLayerMode } from '../domain/hydroway-operational-domain.types';

type OperationalLayerModeLegendProps = {
  mode: HydrowayOperationalLayerMode;
  className?: string;
  itemClassName?: string;
  swatchClassName?: string;
  labelClassName?: string;
  titleClassName?: string;
  listClassName?: string;
  maxItems?: number;
};

export function OperationalLayerModeLegend({
  mode,
  className,
  itemClassName,
  swatchClassName,
  labelClassName,
  titleClassName,
  listClassName,
  maxItems = 4,
}: OperationalLayerModeLegendProps) {
  const tModes = useTranslations('waterwayMap.operationalModes');
  const items = OPERATIONAL_MODE_LEGEND[mode].slice(0, maxItems);

  return (
    <div className={className} data-testid="hydroway-layer-legend">
      <span className={titleClassName}>{tModes('legendTitle')}</span>
      <ul className={listClassName}>
        {items.map((item) => (
          <li key={item.key} className={itemClassName}>
            <span
              className={swatchClassName}
              style={{
                backgroundColor: item.dashed ? 'transparent' : item.color,
                borderColor: item.color,
                borderStyle: item.dashed ? 'dashed' : 'solid',
              }}
              aria-hidden
            />
            <span className={labelClassName}>{tModes(`${mode}.legend.${item.key}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import * as echarts from 'echarts/core';
import { BarChart, GaugeChart, LineChart, RadarChart } from 'echarts/charts';
import {
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  GaugeChart,
  LineChart,
  RadarChart,
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
  CanvasRenderer,
]);

type OperationalEChartProps = {
  option: EChartsCoreOption;
  ariaLabel: string;
  className?: string;
};

export function OperationalEChart({
  option,
  ariaLabel,
  className,
}: OperationalEChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = echarts.init(ref.current, undefined, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    chart.setOption(option, {
      notMerge: true,
      lazyUpdate: true,
    });

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return <div ref={ref} role="img" aria-label={ariaLabel} className={className} />;
}

export type { EChartsCoreOption };

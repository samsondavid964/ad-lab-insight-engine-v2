import { useState, useCallback, RefObject } from "react";

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
}

export interface ChartInfo {
  id: string;
  type: string;
  labels: string[];
  datasets: ChartDataset[];
  title: string;
  instance: any;
}

export function useChartInstances(iframeRef: RefObject<HTMLIFrameElement>) {
  const [selectedChart, setSelectedChart] = useState<ChartInfo | null>(null);

  const getChartInstances = useCallback((): ChartInfo[] => {
    const win = iframeRef.current?.contentWindow as any;
    if (!win?.Chart?.instances) return [];

    return Object.values(win.Chart.instances).map((chart: any) => ({
      id: chart.canvas?.id || chart.id?.toString() || Math.random().toString(36).slice(2),
      type: chart.config.type,
      labels: [...(chart.data.labels || [])],
      datasets: chart.data.datasets.map((ds: any) => ({
        label: ds.label || "",
        data: [...ds.data],
        backgroundColor: ds.backgroundColor,
        borderColor: ds.borderColor,
      })),
      title: chart.options?.plugins?.title?.text || "",
      instance: chart,
    }));
  }, [iframeRef]);

  const updateChart = useCallback((chartInfo: ChartInfo) => {
    const chart = chartInfo.instance;
    if (!chart) return;

    chart.config.type = chartInfo.type;
    chart.data.labels = chartInfo.labels;
    chart.data.datasets = chartInfo.datasets.map((ds, i) => ({
      ...chart.data.datasets[i],
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor,
      borderColor: ds.borderColor,
    }));

    if (chartInfo.title) {
      if (!chart.options.plugins) chart.options.plugins = {};
      if (!chart.options.plugins.title) chart.options.plugins.title = {};
      chart.options.plugins.title.text = chartInfo.title;
      chart.options.plugins.title.display = true;
    }

    chart.update();
    setSelectedChart({ ...chartInfo });
  }, []);

  const setupChartClickHandlers = useCallback((onChartClick: (chart: ChartInfo) => void) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;

    const canvases = doc.querySelectorAll("canvas");
    canvases.forEach(canvas => {
      canvas.addEventListener("click", (e) => {
        e.stopPropagation();
        const charts = getChartInstances();
        const clicked = charts.find(c => c.instance.canvas === canvas);
        if (clicked) {
          onChartClick(clicked);
        }
      });
    });
  }, [iframeRef, getChartInstances]);

  return { selectedChart, setSelectedChart, getChartInstances, updateChart, setupChartClickHandlers };
}

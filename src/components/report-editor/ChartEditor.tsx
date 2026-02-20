import { useState, useEffect } from "react";
import { ChartInfo, ChartDataset } from "./useChartInstances";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, Plus, Trash2, BarChart3 } from "lucide-react";

interface ChartEditorProps {
  chart: ChartInfo | null;
  onClose: () => void;
  onUpdate: (chart: ChartInfo) => void;
}

const CHART_TYPES = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "pie", label: "Pie" },
  { value: "doughnut", label: "Doughnut" },
  { value: "radar", label: "Radar" },
  { value: "polarArea", label: "Polar Area" },
];

const ChartEditor = ({ chart, onClose, onUpdate }: ChartEditorProps) => {
  const [localChart, setLocalChart] = useState<ChartInfo | null>(null);

  useEffect(() => {
    if (chart) {
      setLocalChart(JSON.parse(JSON.stringify({ ...chart, instance: undefined })));
      // Keep instance reference
      if (localChart) localChart.instance = chart.instance;
    }
  }, [chart?.id]);

  // Sync instance ref
  useEffect(() => {
    if (localChart && chart) {
      localChart.instance = chart.instance;
    }
  }, [localChart, chart]);

  if (!chart || !localChart) return null;

  const updateAndApply = (updated: ChartInfo) => {
    updated.instance = chart.instance;
    setLocalChart({ ...updated });
    onUpdate(updated);
  };

  const handleLabelChange = (index: number, value: string) => {
    const updated = { ...localChart };
    updated.labels[index] = value;
    updateAndApply(updated);
  };

  const handleDataChange = (datasetIdx: number, dataIdx: number, value: string) => {
    const updated = { ...localChart };
    updated.datasets[datasetIdx].data[dataIdx] = parseFloat(value) || 0;
    updateAndApply(updated);
  };

  const handleDatasetLabelChange = (datasetIdx: number, value: string) => {
    const updated = { ...localChart };
    updated.datasets[datasetIdx].label = value;
    updateAndApply(updated);
  };

  const handleColorChange = (datasetIdx: number, color: string) => {
    const updated = { ...localChart };
    updated.datasets[datasetIdx].backgroundColor = color;
    updated.datasets[datasetIdx].borderColor = color;
    updateAndApply(updated);
  };

  const addRow = () => {
    const updated = { ...localChart };
    updated.labels.push(`Label ${updated.labels.length + 1}`);
    updated.datasets.forEach(ds => ds.data.push(0));
    updateAndApply(updated);
  };

  const removeRow = (index: number) => {
    const updated = { ...localChart };
    updated.labels.splice(index, 1);
    updated.datasets.forEach(ds => ds.data.splice(index, 1));
    updateAndApply(updated);
  };

  const addDataset = () => {
    const updated = { ...localChart };
    const colors = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];
    const color = colors[updated.datasets.length % colors.length];
    updated.datasets.push({
      label: `Dataset ${updated.datasets.length + 1}`,
      data: updated.labels.map(() => 0),
      backgroundColor: color,
      borderColor: color,
    });
    updateAndApply(updated);
  };

  const removeDataset = (index: number) => {
    const updated = { ...localChart };
    updated.datasets.splice(index, 1);
    updateAndApply(updated);
  };

  return (
    <Sheet open={!!chart} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-[420px] overflow-y-auto sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Edit Chart
          </SheetTitle>
          <SheetDescription>Modify chart data, type, and appearance</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Chart Title */}
          <div className="space-y-2">
            <Label>Chart Title</Label>
            <Input
              value={localChart.title}
              onChange={(e) => {
                const updated = { ...localChart, title: e.target.value };
                updateAndApply(updated);
              }}
              placeholder="Chart title"
            />
          </div>

          {/* Chart Type */}
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <Select
              value={localChart.type}
              onValueChange={(value) => {
                const updated = { ...localChart, type: value };
                updateAndApply(updated);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datasets */}
          {localChart.datasets.map((dataset, dsIdx) => (
            <div key={dsIdx} className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={typeof dataset.backgroundColor === "string" ? dataset.backgroundColor : "#3b82f6"}
                    onChange={(e) => handleColorChange(dsIdx, e.target.value)}
                    className="h-6 w-6 cursor-pointer rounded border-0 p-0"
                  />
                  <Input
                    value={dataset.label}
                    onChange={(e) => handleDatasetLabelChange(dsIdx, e.target.value)}
                    className="h-8 text-sm"
                    placeholder="Dataset name"
                  />
                </div>
                {localChart.datasets.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeDataset(dsIdx)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addDataset} className="w-full">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Dataset
          </Button>

          {/* Data Table */}
          <div className="space-y-2">
            <Label>Data</Label>
            <div className="max-h-72 overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Label</TableHead>
                    {localChart.datasets.map((ds, i) => (
                      <TableHead key={i} className="w-24">{ds.label || `DS ${i + 1}`}</TableHead>
                    ))}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localChart.labels.map((label, rowIdx) => (
                    <TableRow key={rowIdx}>
                      <TableCell className="p-1">
                        <Input
                          value={label}
                          onChange={(e) => handleLabelChange(rowIdx, e.target.value)}
                          className="h-7 text-xs"
                        />
                      </TableCell>
                      {localChart.datasets.map((ds, dsIdx) => (
                        <TableCell key={dsIdx} className="p-1">
                          <Input
                            type="number"
                            value={ds.data[rowIdx] ?? 0}
                            onChange={(e) => handleDataChange(dsIdx, rowIdx, e.target.value)}
                            className="h-7 text-xs"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="p-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(rowIdx)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="outline" size="sm" onClick={addRow} className="w-full">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Row
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChartEditor;

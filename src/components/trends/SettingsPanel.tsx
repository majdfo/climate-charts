import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnalysisSettings } from '@/lib/trendAnalysis';

interface SettingsPanelProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const updateSettings = (key: keyof AnalysisSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Settings</CardTitle>
        <CardDescription>Configure season detection parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year-start">Start Year</Label>
            <Input
              id="year-start"
              type="number"
              value={settings.yearRange[0]}
              onChange={(e) =>
                updateSettings('yearRange', [parseInt(e.target.value), settings.yearRange[1]])
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year-end">End Year</Label>
            <Input
              id="year-end"
              type="number"
              value={settings.yearRange[1]}
              onChange={(e) =>
                updateSettings('yearRange', [settings.yearRange[0], parseInt(e.target.value)])
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rolling-window">Rolling Window (days)</Label>
          <Input
            id="rolling-window"
            type="number"
            value={settings.rollingWindow}
            onChange={(e) => updateSettings('rollingWindow', parseInt(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold-mode">Threshold Mode</Label>
          <Select
            value={settings.thresholdMode}
            onValueChange={(value) => updateSettings('thresholdMode', value)}
          >
            <SelectTrigger id="threshold-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dynamic">Dynamic (Percentile)</SelectItem>
              <SelectItem value="static">Static (Fixed Value)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {settings.thresholdMode === 'dynamic' ? (
          <div className="space-y-2">
            <Label htmlFor="percentile">Percentile</Label>
            <Select
              value={settings.dynamicPercentile.toString()}
              onValueChange={(value) => updateSettings('dynamicPercentile', parseInt(value))}
            >
              <SelectTrigger id="percentile">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">P90</SelectItem>
                <SelectItem value="95">P95</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="static-threshold">Static Threshold</Label>
            <Input
              id="static-threshold"
              type="number"
              step="0.1"
              value={settings.staticThreshold}
              onChange={(e) => updateSettings('staticThreshold', parseFloat(e.target.value))}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-persistence">Start Persistence (days)</Label>
            <Input
              id="start-persistence"
              type="number"
              value={settings.startPersistence}
              onChange={(e) => updateSettings('startPersistence', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-persistence">End Persistence (days)</Label>
            <Input
              id="end-persistence"
              type="number"
              value={settings.endPersistence}
              onChange={(e) => updateSettings('endPersistence', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intensity-metric">Intensity Metric</Label>
          <Select
            value={settings.intensityMetric}
            onValueChange={(value) => updateSettings('intensityMetric', value)}
          >
            <SelectTrigger id="intensity-metric">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="area">Area (Sum of values)</SelectItem>
              <SelectItem value="peak">Peak (Maximum value)</SelectItem>
              <SelectItem value="average">Average (Mean value)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

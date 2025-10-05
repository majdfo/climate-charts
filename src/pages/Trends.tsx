import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play, TrendingUp } from 'lucide-react';
import { CSVUploader } from '@/components/trends/CSVUploader';
import { ColumnMapper } from '@/components/trends/ColumnMapper';
import { SettingsPanel } from '@/components/trends/SettingsPanel';
import { SeasonTable } from '@/components/trends/SeasonTable';
import { TopYearsBar } from '@/components/trends/TopYearsBar';
import {
  processData,
  detectSeasons,
  AnalysisSettings,
  SeasonResult,
} from '@/lib/trendAnalysis';
import { toast } from '@/hooks/use-toast';

const currentYear = new Date().getFullYear();

const defaultSettings: AnalysisSettings = {
  yearRange: [currentYear - 9, currentYear],
  rollingWindow: 5,
  thresholdMode: 'dynamic',
  dynamicPercentile: 95,
  staticThreshold: 50,
  startPersistence: 7,
  endPersistence: 7,
  intensityMetric: 'area',
};

export default function Trends() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [dateColumn, setDateColumn] = useState('');
  const [valueColumn, setValueColumn] = useState('');
  const [locationColumn, setLocationColumn] = useState<string | undefined>();
  const [settings, setSettings] = useState<AnalysisSettings>(defaultSettings);
  const [results, setResults] = useState<SeasonResult[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDataLoaded = (data: any[], cols: string[]) => {
    setRawData(data);
    setColumns(cols);
    setResults([]);
    setWarnings([]);

    // Auto-select columns if possible
    const dateCol = cols.find(c => c.toLowerCase().includes('date'));
    const valueCol = cols.find(c => c.toLowerCase().includes('value') || c.toLowerCase().includes('bloom'));
    const locCol = cols.find(c => c.toLowerCase().includes('location') || c.toLowerCase().includes('station'));

    if (dateCol) setDateColumn(dateCol);
    if (valueCol) setValueColumn(valueCol);
    if (locCol) setLocationColumn(locCol);
  };

  const runAnalysis = () => {
    if (!dateColumn || !valueColumn) {
      toast({
        title: 'Missing columns',
        description: 'Please select date and value columns',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const { data, warnings: procWarnings } = processData(
          rawData,
          dateColumn,
          valueColumn,
          locationColumn
        );

        if (data.length === 0) {
          throw new Error('No valid data rows after processing');
        }

        setWarnings(procWarnings);

        const seasonResults = detectSeasons(data, settings);
        setResults(seasonResults);

        toast({
          title: 'Analysis complete',
          description: `Detected seasons for ${seasonResults.length} years`,
        });
      } catch (error: any) {
        toast({
          title: 'Analysis failed',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Custom Trend Analysis - Coming Soon</h1>
        <p className="text-muted-foreground">Upload your own data and analyze seasonal patterns</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Feature Under Development</CardTitle>
          <CardDescription>
            We're working on making FloraSat scalable for all locations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Currently Available</h3>
            <p className="text-sm text-muted-foreground mb-2">
              FloraSat currently provides pollen tracking and historical data for <strong>Irbid, Jordan</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              View current forecasts on the Dashboard and explore 10 years of historical pollen trends.
            </p>
          </div>

          <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span>🚀</span> Coming Soon: Custom Location Analysis
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              We're developing scalability features that will allow you to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>Upload your own location data</li>
              <li>Analyze CSV files with weather factors and EVI (Enhanced Vegetation Index) data</li>
              <li>Generate personalized dashboards for your specific region</li>
              <li>Access historical trends customized to your location</li>
              <li>Compare seasonal patterns across different years</li>
            </ul>
          </div>

          <div className="pt-4">
            <h4 className="font-medium text-sm mb-2">Required CSV Format (Future)</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Your CSV should include: date, pollen values, weather factors (temperature, humidity, precipitation), and EVI data
            </p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">
              <div>date,pollen_value,temperature,humidity,precipitation,evi</div>
              <div>2024-01-01,42.5,15.2,65.0,0.0,0.45</div>
              <div>2024-01-02,45.2,16.1,62.0,2.5,0.47</div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button disabled className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upload Data (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

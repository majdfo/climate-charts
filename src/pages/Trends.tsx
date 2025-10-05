import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play } from 'lucide-react';
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
        <h1 className="text-3xl font-bold">Trend Analysis</h1>
        <p className="text-muted-foreground">Upload data and analyze seasonal patterns</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <CSVUploader onDataLoaded={handleDataLoaded} />
          
          {columns.length > 0 && (
            <>
              <ColumnMapper
                columns={columns}
                dateColumn={dateColumn}
                valueColumn={valueColumn}
                locationColumn={locationColumn}
                onDateColumnChange={setDateColumn}
                onValueColumnChange={setValueColumn}
                onLocationColumnChange={setLocationColumn}
              />
              
              <SettingsPanel settings={settings} onSettingsChange={setSettings} />
              
              <Button
                onClick={runAnalysis}
                disabled={!dateColumn || !valueColumn || isAnalyzing}
                className="w-full gap-2"
                size="lg"
              >
                <Play className="h-4 w-4" />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Data Warnings ({warnings.length}):</p>
                <ul className="text-sm space-y-1">
                  {warnings.slice(0, 5).map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                  {warnings.length > 5 && (
                    <li className="text-muted-foreground">
                      ... and {warnings.length - 5} more
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {results.length > 0 ? (
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table">Season Table</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table" className="space-y-6">
                <SeasonTable results={results} />
              </TabsContent>
              
              <TabsContent value="charts" className="space-y-6">
                <TopYearsBar results={results} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">No analysis results yet</p>
                <p className="text-sm">Upload data and run analysis to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

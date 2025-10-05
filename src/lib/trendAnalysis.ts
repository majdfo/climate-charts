import Papa from 'papaparse';

export interface DataRow {
  date: Date;
  value: number;
  location?: string;
}

export interface SeasonResult {
  year: number;
  seasonStart: Date | null;
  seasonEnd: Date | null;
  durationDays: number;
  intensity: number;
  peakDate: Date | null;
  peakValue: number;
}

export interface AnalysisSettings {
  yearRange: [number, number];
  rollingWindow: number;
  thresholdMode: 'dynamic' | 'static';
  dynamicPercentile: number;
  staticThreshold: number;
  startPersistence: number;
  endPersistence: number;
  intensityMetric: 'area' | 'peak' | 'average';
}

export function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

export function parseDate(dateStr: string): Date | null {
  // Try multiple date formats
  const formats = [
    // ISO format
    /^\d{4}-\d{2}-\d{2}/,
    // DD/MM/YYYY or MM/DD/YYYY
    /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/,
  ];

  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    // Continue to next format
  }

  return null;
}

export function processData(
  rawData: any[],
  dateColumn: string,
  valueColumn: string,
  locationColumn?: string
): { data: DataRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const data: DataRow[] = [];

  rawData.forEach((row, index) => {
    const dateStr = row[dateColumn];
    const valueStr = row[valueColumn];

    if (!dateStr || !valueStr) {
      warnings.push(`Row ${index + 1}: Missing date or value`);
      return;
    }

    const date = parseDate(dateStr);
    if (!date) {
      warnings.push(`Row ${index + 1}: Could not parse date "${dateStr}"`);
      return;
    }

    const value = parseFloat(valueStr);
    if (isNaN(value)) {
      warnings.push(`Row ${index + 1}: Invalid numeric value "${valueStr}"`);
      return;
    }

    data.push({
      date,
      value,
      location: locationColumn ? row[locationColumn] : undefined,
    });
  });

  return { data, warnings };
}

export function calculateRollingMean(data: DataRow[], window: number): Map<string, number> {
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const rollingMeans = new Map<string, number>();

  for (let i = 0; i < sorted.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(sorted.length, i + Math.ceil(window / 2));
    const subset = sorted.slice(start, end);
    const mean = subset.reduce((sum, d) => sum + d.value, 0) / subset.length;
    rollingMeans.set(sorted[i].date.toISOString(), mean);
  }

  return rollingMeans;
}

export function calculateThreshold(
  data: DataRow[],
  mode: 'dynamic' | 'static',
  percentile: number,
  staticValue: number
): number {
  if (mode === 'static') {
    return staticValue;
  }

  const values = data.map(d => d.value).sort((a, b) => a - b);
  const index = Math.floor(values.length * (percentile / 100));
  return values[index];
}

export function detectSeasons(
  data: DataRow[],
  settings: AnalysisSettings
): SeasonResult[] {
  const results: SeasonResult[] = [];
  const rollingMeans = calculateRollingMean(data, settings.rollingWindow);
  const threshold = calculateThreshold(
    data,
    settings.thresholdMode,
    settings.dynamicPercentile,
    settings.staticThreshold
  );

  // Group by year
  const yearGroups = new Map<number, DataRow[]>();
  data.forEach(row => {
    const year = row.date.getFullYear();
    if (year >= settings.yearRange[0] && year <= settings.yearRange[1]) {
      if (!yearGroups.has(year)) {
        yearGroups.set(year, []);
      }
      yearGroups.get(year)!.push(row);
    }
  });

  // Detect season for each year
  yearGroups.forEach((yearData, year) => {
    const sorted = yearData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let seasonStart: Date | null = null;
    let seasonEnd: Date | null = null;
    let aboveCount = 0;
    let belowCount = 0;
    let inSeason = false;

    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      const rolling = rollingMeans.get(row.date.toISOString()) || row.value;

      if (!inSeason && rolling >= threshold) {
        aboveCount++;
        if (aboveCount >= settings.startPersistence) {
          seasonStart = sorted[i - settings.startPersistence + 1].date;
          inSeason = true;
          aboveCount = 0;
        }
      } else if (inSeason && rolling < threshold) {
        belowCount++;
        if (belowCount >= settings.endPersistence) {
          seasonEnd = sorted[i - settings.endPersistence + 1].date;
          break;
        }
      } else if (!inSeason) {
        aboveCount = 0;
      } else {
        belowCount = 0;
      }
    }

    // Calculate metrics
    let intensity = 0;
    let peakValue = 0;
    let peakDate: Date | null = null;

    if (seasonStart && seasonEnd) {
      const seasonData = sorted.filter(
        d => d.date >= seasonStart! && d.date <= seasonEnd!
      );

      if (settings.intensityMetric === 'area') {
        intensity = seasonData.reduce((sum, d) => sum + d.value, 0);
      } else if (settings.intensityMetric === 'peak') {
        const peak = seasonData.reduce((max, d) => d.value > max.value ? d : max);
        intensity = peak.value;
        peakValue = peak.value;
        peakDate = peak.date;
      } else if (settings.intensityMetric === 'average') {
        intensity = seasonData.reduce((sum, d) => sum + d.value, 0) / seasonData.length;
      }

      // Find peak even if not using peak metric
      if (!peakDate) {
        const peak = seasonData.reduce((max, d) => d.value > max.value ? d : max);
        peakValue = peak.value;
        peakDate = peak.date;
      }
    }

    const durationDays = seasonStart && seasonEnd
      ? Math.round((seasonEnd.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    results.push({
      year,
      seasonStart,
      seasonEnd,
      durationDays,
      intensity,
      peakDate,
      peakValue,
    });
  });

  return results.sort((a, b) => b.year - a.year);
}

export function getTopYears(results: SeasonResult[], count: number = 3): SeasonResult[] {
  return [...results]
    .filter(r => r.intensity > 0)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, count);
}

export function exportToCSV(results: SeasonResult[], filename: string = 'season-analysis.csv') {
  const headers = [
    'Year',
    'Season Start',
    'Season End',
    'Duration (Days)',
    'Intensity',
    'Peak Date',
    'Peak Value',
  ];

  const rows = results.map(r => [
    r.year,
    r.seasonStart ? r.seasonStart.toISOString().split('T')[0] : '',
    r.seasonEnd ? r.seasonEnd.toISOString().split('T')[0] : '',
    r.durationDays,
    r.intensity.toFixed(2),
    r.peakDate ? r.peakDate.toISOString().split('T')[0] : '',
    r.peakValue.toFixed(2),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

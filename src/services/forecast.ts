import Papa from 'papaparse';

export type ForecastRow = {
  date: string;
  lat: number;
  lon: number;
  score: number | null;
  severity: string | null;
};

export async function fetchNext7Days(lat: number, lon: number) {
  const today = new Date();
  const end = new Date(Date.now() + 7 * 864e5);
  const from = today.toISOString().slice(0, 10);
  const to = end.toISOString().slice(0, 10);

  const response = await fetch('/pollen_forecast_daily_rows.csv');
  const csvText = await response.text();
  
  return new Promise<ForecastRow[]>((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data as ForecastRow[];
        const filtered = data.filter(row => 
          row.date && 
          row.lat === lat && 
          row.lon === lon &&
          row.date >= from && 
          row.date <= to
        );
        resolve(filtered);
      },
      error: (error) => reject(error)
    });
  });
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import pollen2015 from '@/assets/pollen-2015.png';
import pollen2016 from '@/assets/pollen-2016.png';
import pollen2017 from '@/assets/pollen-2017.png';
import pollen2018 from '@/assets/pollen-2018.png';
import pollen2019 from '@/assets/pollen-2019.png';
import pollen2020 from '@/assets/pollen-2020.png';
import pollen2021 from '@/assets/pollen-2021.png';
import pollen2022 from '@/assets/pollen-2022.png';
import pollen2023 from '@/assets/pollen-2023.png';
import pollen2024 from '@/assets/pollen-2024.png';

// Season data from CSV
const seasonData: Record<number, { start: string; end: string; duration: number }> = {
  2015: { start: '2015-04-10', end: '2015-05-31', duration: 52 },
  2016: { start: '2016-04-02', end: '2016-05-17', duration: 46 },
  2017: { start: '2017-04-14', end: '2017-05-24', duration: 41 },
  2018: { start: '2018-03-17', end: '2018-05-08', duration: 53 },
  2019: { start: '2019-04-30', end: '2019-05-31', duration: 32 },
  2020: { start: '2020-04-17', end: '2020-05-27', duration: 41 },
  2021: { start: '2021-03-24', end: '2021-05-09', duration: 47 },
  2022: { start: '2022-04-14', end: '2022-05-24', duration: 41 },
  2023: { start: '2023-03-30', end: '2023-05-21', duration: 53 },
  2024: { start: '2024-03-30', end: '2024-05-12', duration: 44 },
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function HistoricalTrends() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Historical Jordan Pollen Trends</h1>
        <p className="text-muted-foreground">Pollen season patterns from 2015 to 2024</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Decade of Pollen Data</CardTitle>
          <CardDescription>
            Historical analysis showing pollen index variations across seasons in Jordan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { year: 2015, image: pollen2015 },
              { year: 2016, image: pollen2016 },
              { year: 2017, image: pollen2017 },
              { year: 2018, image: pollen2018 },
              { year: 2019, image: pollen2019 },
              { year: 2020, image: pollen2020 },
              { year: 2021, image: pollen2021 },
              { year: 2022, image: pollen2022 },
              { year: 2023, image: pollen2023 },
              { year: 2024, image: pollen2024 },
            ].map(({ year, image }) => {
              const season = seasonData[year];
              return (
                <div key={year} className="border rounded-lg p-4 bg-card hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold mb-3 text-center">Pollen Season {year}</h3>
                  <img 
                    src={image} 
                    alt={`Pollen season trends for ${year}`}
                    className="w-full h-auto rounded mb-4"
                  />
                  {season && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground font-medium">Start:</span>
                        <Badge variant="outline">{formatDate(season.start)}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground font-medium">End:</span>
                        <Badge variant="outline">{formatDate(season.end)}</Badge>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground font-medium">Duration:</span>
                        <Badge variant="secondary">{season.duration} days</Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

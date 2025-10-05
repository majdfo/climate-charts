import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            ].map(({ year, image }) => (
              <div key={year} className="border rounded-lg p-4 bg-card hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-3 text-center">Pollen Season {year}</h3>
                <img 
                  src={image} 
                  alt={`Pollen season trends for ${year}`}
                  className="w-full h-auto rounded"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

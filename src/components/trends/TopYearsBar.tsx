import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SeasonResult, getTopYears } from '@/lib/trendAnalysis';

interface TopYearsBarProps {
  results: SeasonResult[];
}

export function TopYearsBar({ results }: TopYearsBarProps) {
  const topYears = getTopYears(results, 3);
  const chartData = [...results]
    .filter(r => r.intensity > 0)
    .sort((a, b) => b.intensity - a.intensity)
    .map(r => ({
      year: r.year.toString(),
      intensity: r.intensity,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Bloom Years</CardTitle>
        <CardDescription>Years with highest intensity values</CardDescription>
        <div className="flex gap-2 pt-2">
          {topYears.map((result, index) => (
            <Badge key={result.year} variant={index === 0 ? 'default' : 'secondary'}>
              #{index + 1} {result.year} ({result.intensity.toFixed(1)})
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="year" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Bar dataKey="intensity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download } from 'lucide-react';
import { SeasonResult, exportToCSV } from '@/lib/trendAnalysis';

interface SeasonTableProps {
  results: SeasonResult[];
}

export function SeasonTable({ results }: SeasonTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Season Analysis</CardTitle>
            <CardDescription>Detected seasons for each year</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(results)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Intensity</TableHead>
              <TableHead>Peak Date</TableHead>
              <TableHead>Peak Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.year}>
                <TableCell className="font-medium">{result.year}</TableCell>
                <TableCell>
                  {result.seasonStart
                    ? result.seasonStart.toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {result.seasonEnd
                    ? result.seasonEnd.toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>{result.durationDays} days</TableCell>
                <TableCell>{result.intensity.toFixed(2)}</TableCell>
                <TableCell>
                  {result.peakDate
                    ? result.peakDate.toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell>{result.peakValue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

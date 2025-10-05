import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ColumnMapperProps {
  columns: string[];
  dateColumn: string;
  valueColumn: string;
  locationColumn?: string;
  onDateColumnChange: (column: string) => void;
  onValueColumnChange: (column: string) => void;
  onLocationColumnChange: (column: string | undefined) => void;
}

export function ColumnMapper({
  columns,
  dateColumn,
  valueColumn,
  locationColumn,
  onDateColumnChange,
  onValueColumnChange,
  onLocationColumnChange,
}: ColumnMapperProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Column Mapping</CardTitle>
        <CardDescription>
          Map your CSV columns to the required fields
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date-column">Date Column *</Label>
          <Select value={dateColumn} onValueChange={onDateColumnChange}>
            <SelectTrigger id="date-column">
              <SelectValue placeholder="Select date column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="value-column">Value Column *</Label>
          <Select value={valueColumn} onValueChange={onValueColumnChange}>
            <SelectTrigger id="value-column">
              <SelectValue placeholder="Select value column" />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location-column">Location Column (Optional)</Label>
          <Select
            value={locationColumn || 'none'}
            onValueChange={(value) =>
              onLocationColumnChange(value === 'none' ? undefined : value)
            }
          >
            <SelectTrigger id="location-column">
              <SelectValue placeholder="Select location column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

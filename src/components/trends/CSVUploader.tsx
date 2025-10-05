import { useState } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseCSV } from '@/lib/trendAnalysis';
import { toast } from '@/hooks/use-toast';

interface CSVUploaderProps {
  onDataLoaded: (data: any[], columns: string[]) => void;
}

export function CSVUploader({ onDataLoaded }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = await parseCSV(file);
      if (data.length === 0) {
        throw new Error('CSV file is empty');
      }

      const columns = Object.keys(data[0]);
      setFileName(file.name);
      onDataLoaded(data, columns);

      toast({
        title: 'File uploaded',
        description: `Loaded ${data.length} rows from ${file.name}`,
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV Data</CardTitle>
        <CardDescription>
          Upload your time-series data. File should contain date, value, and optional location columns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center gap-4">
            {fileName ? (
              <FileUp className="h-12 w-12 text-primary" />
            ) : (
              <Upload className="h-12 w-12 text-muted-foreground" />
            )}
            
            {fileName ? (
              <>
                <p className="font-medium text-lg">{fileName}</p>
                <p className="text-sm text-muted-foreground">
                  Click or drag to replace file
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-lg">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </>
            )}
            
            <Button variant="outline" className="pointer-events-none">
              Select File
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">CSV Format Example:</p>
          <code className="block bg-muted p-2 rounded">
            date,value,location<br />
            2024-01-01,42.5,Station A<br />
            2024-01-02,45.2,Station A
          </code>
        </div>
      </CardContent>
    </Card>
  );
}

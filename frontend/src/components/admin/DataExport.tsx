import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Download, FileText, Database } from 'lucide-react';
import { exportService } from '@/services/exportService';
import { toast } from 'sonner';

interface Dataset {
  name: string;
  formats: string[];
  downloadUrl: string;
}

export default function DataExport() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await exportService.listDatasets();
      setDatasets(data.datasets);
    } catch (error) {
      console.error('Failed to load datasets:', error);
      toast.error('Failed to load datasets');
    }
  };

  const handleExport = async (datasetName: string) => {
    setLoading(true);
    try {
      await exportService.downloadCSV(datasetName);
      toast.success(`Successfully exported ${datasetName}.csv`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-slate-100 bg-slate-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Database className="h-5 w-5 text-blue-500" />
          <span>ML Training Datasets Export</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Export ML training datasets in CSV format for analysis and model training.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {datasets.map((dataset) => (
              <div
                key={dataset.name}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-800">
                      {dataset.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-slate-500">
                      Available formats: {dataset.formats.join(', ').toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleExport(dataset.name)}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            ))}
          </div>

          {datasets.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Database className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No datasets available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


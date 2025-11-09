import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { SeedService } from './seed.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('export')
export class ExportController {
  constructor(private readonly seedService: SeedService) {}

  @Get('csv/:dataset')
  async exportCSV(@Param('dataset') dataset: string, @Res() res: Response) {
    try {
      const datasetName = dataset || 'career-recommendations';
      const possiblePaths = [
        path.join(process.cwd(), 'src/algorithms/datasets/ml-training', `${datasetName}.csv`),
        path.join(__dirname, '../algorithms/datasets/ml-training', `${datasetName}.csv`),
        path.join(__dirname, '../../algorithms/datasets/ml-training', `${datasetName}.csv`),
      ];

      let csvPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          csvPath = p;
          break;
        }
      }

      if (!csvPath) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${datasetName}.csv"`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export CSV', message: error.message });
    }
  }

  @Get('datasets')
  async listDatasets(@Res() res: Response) {
    try {
      const datasets = [
        'career-recommendations',
        'user-profiles',
        'resume-analysis-dataset',
        'job-recommendations-dataset',
        'chatbot-responses-dataset',
      ];

      res.json({
        datasets: datasets.map(name => ({
          name,
          formats: ['json', 'csv'],
          downloadUrl: `/export/csv/${name}`,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list datasets', message: error.message });
    }
  }
}


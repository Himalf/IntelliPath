import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { ResumeAnalysisService } from './resume-analysis.service';

@Controller('resume-analysis')
export class ResumeAnalysisController {
  constructor(private readonly resumeService: ResumeAnalysisService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('analyze/:userId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
  analyzeResume(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.resumeService.analyzeResume(userId, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  getAnalysis(@Param('userId') userId: string) {
    return this.resumeService.getAnalysisByUser(userId);
  }
}

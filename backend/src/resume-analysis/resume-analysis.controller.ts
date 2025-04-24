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
import { ResumeAnalysisService } from './resume-analysis.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth-guard';
import { RoleGuards } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from 'src/users/schemas/user.schema';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuards)
@Controller('resume-analysis')
export class ResumeAnalysisController {
  constructor(private readonly resumeService: ResumeAnalysisService) {}

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
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
    console.log('Received file:', file);
    return this.resumeService.analyzeResume(userId, file);
  }

  @Roles(UserRole.USER, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get(':userId')
  getAnalysis(@Param('userId') userId: string) {
    return this.resumeService.getAnalysisByUser(userId);
  }
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Get()
  getAllAnalyses() {
    return this.resumeService.findAllAnalyses();
  }
}

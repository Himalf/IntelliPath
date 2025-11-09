import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { WinstonLogger, WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger.config';
import { TransformInterceptor } from './utils/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('IntelliPath Career Guidance API')
    .setDescription('Comprehensive career guidance platform API with AI-powered features')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('career-suggestions', 'AI-powered career recommendations')
    .addTag('resume-analysis', 'Resume analysis and job recommendations')
    .addTag('chatbot', 'AI chatbot queries')
    .addTag('courses', 'Course management')
    .addTag('feedback', 'User feedback')
    .addTag('seed', 'Database seeding')
    .addTag('export', 'Data export')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

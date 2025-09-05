import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Appointment Scheduler API')
    .setDescription('Production-ready appointment scheduling system with TypeORM')
    .setVersion('1.0')
    .addTag('Availability', 'Check available appointment slots')
    .addTag('Appointments', 'Book and manage appointments')
    .addTag('Config', 'Runtime configuration management')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS robusto para Local & Cloudflare Pages/Workers
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes('pages.dev') ||
        origin.includes('trycloudflare.com') ||
        origin.includes('workers.dev') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Workspace-Id',
      'x-workspace-id',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Origin',
    ],
    optionsSuccessStatus: 204,
  });

  // Global API Prefix & Versioning (/v1)
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Pipes & Filters
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
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Alicerce API')
    .setDescription('Alicerce — Goal-Based Personal Finance System API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User profile endpoints')
    .addTag('Workspaces', 'Workspace management endpoints')
    .addTag('Persons', 'Persons and family members')
    .addTag('Salary', 'Salary configuration and adjustments')
    .addTag('Wallets', 'Bank accounts and wallets')
    .addTag('Cards', 'Credit card and bill management')
    .addTag('Installments', 'Installments management')
    .addTag('Incomes', 'Income records')
    .addTag('Expenses', 'Expense records')
    .addTag('Categories', 'Category classification')
    .addTag('Goals', 'Financial goals')
    .addTag('Products', 'Product catalog')
    .addTag('Wishlist', 'Wishlist items and quotations')
    .addTag('Projects', 'Projects, environments and stages')
    .addTag('Planning', 'Budget, forecast, simulation and timeline')
    .addTag('Transactions', 'Transactions and timeline')
    .addTag('Dashboard', 'Dashboard aggregations')
    .addTag('Alerts', 'Alerts and notifications')
    .addTag('Reports', 'Financial reports')
    .addTag('Settings', 'User settings')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Alicerce Backend API is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger Documentation: http://localhost:${port}/api/v1/api-docs`);
}

bootstrap();

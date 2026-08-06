"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-Workspace-Id',
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/v1/api-docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Alicerce Backend API is running on: http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger Documentation: http://localhost:${port}/api/v1/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { CarteirasModule } from './carteiras/carteiras.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    PessoasModule,
    CarteirasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

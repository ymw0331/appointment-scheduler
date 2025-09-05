import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { AppConfig } from './entities/app-config.entity';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([AppConfig])],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
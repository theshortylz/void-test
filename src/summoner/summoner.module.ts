import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummonerEntity } from './summoner.entity';
import { SummonerController } from './summoner.controller';
import { SummonerService } from './summoner.service';

@Module({
  imports: [TypeOrmModule.forFeature([SummonerEntity])],
  controllers: [SummonerController],
  providers: [SummonerService],
  exports: [SummonerService]
})
export class SummonerModule { }

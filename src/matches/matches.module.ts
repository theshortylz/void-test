import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './matches.entity';
import { MatchesController } from './matches.controller';
import { RiotApiService } from './matches.service';
import { SummonerEntity } from 'src/summoner/summoner.entity';
@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity, SummonerEntity])],
  controllers: [MatchesController],
  providers: [RiotApiService],
})
export class MatchesModule {}

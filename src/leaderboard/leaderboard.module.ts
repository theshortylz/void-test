import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboradService } from './leaderboard.service';
import { LeaderboardEntity } from './leaderboard.entity';
import { SummonerEntity } from 'src/summoner/summoner.entity';
@Module({
  imports: [TypeOrmModule.forFeature([LeaderboardEntity, SummonerEntity])],
  controllers: [LeaderboardController],
  providers: [LeaderboradService],
})
export class LeaderboardModule {}

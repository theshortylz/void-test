import { Module } from '@nestjs/common';
import { DatabaseModule } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchesModule } from './matches/matches.module';
import { SummonerModule } from './summoner/summoner.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
// import { RunesModule } from './runes/runes.module';
@Module({
  imports: [DatabaseModule, MatchesModule, SummonerModule, LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from 'src/matches/matches.entity';
import { config } from 'dotenv';
import { SummonerEntity } from 'src/summoner/summoner.entity';
import { LeaderboardEntity } from 'src/leaderboard/leaderboard.entity';
config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: true,
      entities: [MatchEntity, SummonerEntity, LeaderboardEntity],
    }),
  ],
})
export class DatabaseModule { }

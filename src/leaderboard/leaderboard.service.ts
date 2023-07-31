import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SummonerEntity } from 'src/summoner/summoner.entity';

dotenv.config();

export interface Leaderboard {
  summonerName: string;
  wins: number;
  losses: number;
  winRate: string;
  leaguePoints: number;
  tier: string[];
  rank: string;
}

@Injectable()
export class LeaderboradService {
  constructor(
    @InjectRepository(SummonerEntity)
    private readonly summonerRepository: Repository<SummonerEntity>,
  ) {}

  async getSummonersDb(name: string): Promise<SummonerEntity[]> {
    const dbInfo = await this.summonerRepository.find();

    const filteredDbInfo = dbInfo.filter((info) => info.queueInfo !== null);

    return filteredDbInfo;
  }

  async getPlayersID(name: string, region: string): Promise<any[]> {
    const tiersOrder = [
      'CHALLENGER',
      'GRANDMASTER',
      'MASTER',
      'DIAMOND',
      'PLATINUM',
      'GOLD',
      'SILVER',
      'BRONZE',
      'IRON',
    ];

    const summoners = await this.getSummonersDb(name);
    console.log(summoners);
    const validSummoners = summoners.filter(
      (summoner) =>
        summoner.queueInfo &&
        summoner.queueInfo.some((queue) =>
          tiersOrder.includes(queue.summonerTier),
        ),
    );

    validSummoners.sort((a, b) => {
      const tierOrderA = tiersOrder.indexOf(a.queueInfo[0].summonerTier);
      const tierOrderB = tiersOrder.indexOf(b.queueInfo[0].summonerTier);

      if (tierOrderA !== tierOrderB) {
        return tierOrderB - tierOrderA;
      } else {
        const pointsA = Math.max(
          ...a.queueInfo.map((queue) => queue.currentLeagepoints),
        );
        const pointsB = Math.max(
          ...b.queueInfo.map((queue) => queue.currentLeagepoints),
        );
        return pointsB - pointsA;
      }
    });

    const leaderboard = validSummoners.map((summoner, index) => {
      const queueInfo = summoner.queueInfo.map((queue) => ({
        summonerTier: queue.summonerTier,
        summonerRank: queue.summonerRank,
        currentLeagepoints: queue.currentLeagepoints,
        queueType: queue.queueType,
        wins: queue.wins,
        losses: queue.losses,
      }));

      const totalWins = summoner.queueInfo.reduce(
        (total, queue) => total + queue.wins,
        0,
      );
      const totalLosses = summoner.queueInfo.reduce(
        (total, queue) => total + queue.losses,
        0,
      );
      const totalGames = totalWins + totalLosses;
      const winRate = (totalWins / totalGames) * 100;

      return {
        position: index + 1,
        summonerName: summoner.summonerName,
        queueInfo: queueInfo,
        winRate: `${winRate.toFixed(2)}%`,
      };
    });

    return leaderboard;
  }
}

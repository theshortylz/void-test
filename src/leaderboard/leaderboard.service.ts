import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SummonerEntity } from 'src/summoner/summoner.entity';
import { divisions, tiers, LeaderboardEntity } from './leaderboard.entity';
import { SummonerService } from '../summoner/summoner.service';

export class Leaderboard {
  summonerName: string;
  wins: number;
  losses: number;
  leaguePoints: number;
  tier: tiers;
  rank: divisions;
}

export interface KDA {
  summonerName: string,
  puuid: string,
  kills: number,
  deaths: number
  assists: number,
  kda: number,
  gamesPlayed: number
}


@Injectable()
export class LeaderboradService {
  constructor(
    private summonerService: SummonerService,
    @InjectRepository(LeaderboardEntity)
    private readonly leaderboardRepository: Repository<LeaderboardEntity>,
  ) { }

  async getLeaderboardRanked5x5(
    division: string,
    tier: string): Promise<Leaderboard[]> {
    const apiKeyRiot = process.env.API_KEY;
    const apiRiotURL = `https://la1.api.riotgames.com/lol/league/v4/entries/RANKED_SOLO_5x5/${division}/${tier}?page=1&api_key=${apiKeyRiot}`;
    try {
      const response = await axios.get(apiRiotURL);

      const leaderboard: Leaderboard[] = [];

      for (const ranking of response.data) {
        const leaderboardItem: Leaderboard = {
          summonerName: ranking.summonerName,
          rank: ranking.rank,
          tier: ranking.tier,
          leaguePoints: ranking.leaguePoints,
          losses: ranking.losses,
          wins: ranking.wins,
        };

        leaderboard.push(leaderboardItem);
      }

      for (let index = 0; index < 5; index++) {
        const summoner = await this.summonerService.getSummonerInfo('la1', leaderboard[index].summonerName);
        if (!summoner) {
          console.log('Summoner not found. ', leaderboard[index].summonerName)
        }
      }

      const sortedRankings = leaderboard.sort((a, b) => b.leaguePoints - a.leaguePoints)
      return this.leaderboardRepository.save(sortedRankings);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async filterSummonersByKDA(): Promise<SummonerEntity[] | null> {
    const filteredAndSortedSummonerInfo = (await this.summonerService.getAllSummoners())
      .filter((summoner) => summoner.kda > 0)
      .sort((a, b) => b.kda - a.kda);
    return filteredAndSortedSummonerInfo;
  }

  async filterSummonersByLevel(): Promise<SummonerEntity[] | null> {
    const filteredAndSortedSummonerInfo = (await this.summonerService.getAllSummoners())
      .filter((summoner) => summoner.level > 0)
      .sort((a, b) => b.level - a.level);
    return filteredAndSortedSummonerInfo;
  }
}

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { GameType } from 'src/utils/gameTypes';
import { SummonerEntity } from './summoner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionMapping } from 'src/utils/regionsTypes';
dotenv.config();

const gameTypeByValue: { [key: number]: string } = {};

for (const key in GameType) {
  if (isNaN(Number(key))) {
    const value = GameType[key as keyof typeof GameType];
    gameTypeByValue[value] = key;
  }
}

function getGameType(gameTypeId: number): string {
  return gameTypeByValue[gameTypeId] || 'Unknown';
}

export interface SummonerInfo {
  name: string;
  level: number;
  profileIconId: number;
  region: string;
  puuid: string;
  accountId: string;
  kda: number;
  averageCsPerMinute: number;
  averageVisionScore: number;
  queueInfo: QueueInfoItem[];
}
export interface QueueInfoItem {
  currentLeagepoints: number;
  queueType: string;
  summonerRank: string;
  summonerTier: string;
  wins: number;
  losses: number;
}

function getGameTypeFromName(gameTypeName: string): number | undefined {
  for (const [key, value] of Object.entries(GameType)) {
    if (key === gameTypeName) {
      return value as number;
    }
  }
  return undefined;
}

@Injectable()
export class SummonerService {
  constructor(
    @InjectRepository(SummonerEntity)
    private readonly summonerRepository: Repository<SummonerEntity>,
  ) {}

  private getRegionName(regionCode: string): string {
    const regionName = RegionMapping[regionCode as keyof typeof RegionMapping];
    return regionName || 'unknown';
  }

  private async getSummonerFromDB(
    name: string,
    region: string,
  ): Promise<SummonerInfo | null> {
    const summonerInfo = await this.summonerRepository.findOne({
      where: { summonerName: name },
    });

    if (
      !summonerInfo ||
      !summonerInfo.queueInfo ||
      summonerInfo.queueInfo.length === 0
    ) {
      return null;
    }

    return {
      name: summonerInfo.summonerName,
      profileIconId: summonerInfo.profileIconId,
      level: summonerInfo.summonerLevel,
      region: region,
      puuid: summonerInfo.puuid,
      kda: summonerInfo.kda,
      averageCsPerMinute:
        summonerInfo.minionsKilled / summonerInfo.minutesPlayed,
      averageVisionScore: summonerInfo.totalVision / summonerInfo.gamesPlayed,
      accountId: summonerInfo.accountId,
      queueInfo: summonerInfo.queueInfo.map((el) => ({
        currentLeagepoints: el.currentLeagepoints,
        queueType: el.queueType,
        summonerRank: el.summonerRank,
        summonerTier: el.summonerTier,
        wins: el.wins,
        losses: el.losses,
      })),
    };
  }

  private async saveSummonerToDB(summonerInfo: SummonerInfo): Promise<void> {
    const queueInfoArray: QueueInfoItem[] = summonerInfo.queueInfo.map(
      (el) => ({
        currentLeagepoints: el.currentLeagepoints,
        queueType: el.queueType,
        summonerRank: el.summonerRank,
        summonerTier: el.summonerTier,
        wins: el.wins,
        losses: el.losses,
      }),
    );
    const summonerEntity = new SummonerEntity();
    summonerEntity.puuid = summonerInfo.puuid;
    summonerEntity.summonerName = summonerInfo.name;
    summonerEntity.summonerLevel = summonerInfo.level;
    summonerEntity.profileIconId = summonerInfo.profileIconId;
    summonerEntity.accountId = summonerInfo.accountId;
    summonerEntity.region = summonerInfo.region;
    summonerEntity.queueInfo = queueInfoArray;

    await this.summonerRepository.save(summonerEntity);
  }

  async getSummonerInfo(region: string, name: string): Promise<SummonerInfo> {
    const summonerFromDB = await this.getSummonerFromDB(name, region);
    if (summonerFromDB) {
      return summonerFromDB;
    } else {
      const riotApiKey = process.env.API_KEY;
      const apiSummonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${riotApiKey}`;
      try {
        const summonerResponse = await axios.get(apiSummonerUrl);
        const summonerId = summonerResponse.data.id;
        const accountId = summonerResponse.data.accountId;
        const summonerLevel = summonerResponse.data.summonerLevel;
        const profileIconId = summonerResponse.data.profileIconId;
        const puuid = summonerResponse.data.puuid;

        const entriesApi = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${riotApiKey}`;

        const rankAndTierResponse = await axios
          .get(entriesApi)
          .then((res) => res.data);

        const summonerApiInfo: QueueInfoItem[] = [];

        for (const info of rankAndTierResponse) {
          const queueInfoItem: QueueInfoItem = {
            summonerRank: info.rank,
            summonerTier: info.tier,
            queueType: info.queueType,
            currentLeagepoints: info.leaguePoints,
            wins: info.wins,
            losses: info.losses,
          };

          summonerApiInfo.push(queueInfoItem);
        }

        const summonerInfo: SummonerInfo = {
          name: name,
          profileIconId: profileIconId,
          level: summonerLevel,
          region: region,
          puuid: puuid,
          accountId: accountId,
          kda: 0,
          averageCsPerMinute: 0,
          averageVisionScore: 0,
          queueInfo: summonerApiInfo,
        };

        await this.saveSummonerToDB(summonerInfo);

        return summonerInfo;
      } catch (error) {
        console.error('Error fetching summoner:', error);
        throw new Error('Failed to get summoner information');
      }
    }
  }

  async getInfoByQueue(
    region: string,
    name: string,
    queueId: number,
  ): Promise<SummonerInfo | null> {
    const summoners = await this.getSummonerInfo(region, name);
    const typeGame = getGameType(queueId);

    const filteredQueueInfo = summoners.queueInfo.filter(
      (queue) => queue.queueType === typeGame,
    );

    if (filteredQueueInfo.length > 0) {
      const filteredSummonerQueue: SummonerInfo = {
        ...summoners,
        queueInfo: filteredQueueInfo,
      };
      return filteredSummonerQueue;
    } else {
      return null;
    }
  }
}

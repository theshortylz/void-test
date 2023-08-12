import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { GameType } from 'src/utils/gameTypes';
import { SummonerEntity } from './summoner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegionMapping } from 'src/utils/regionsTypes';

export interface SummonerInfo {
  summonerName: string;
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
  currentLeaguePoints: number;
  queueType: string;
  summonerRank: string;
  summonerTier: string;
  wins: number;
  losses: number;
}

const gameTypeByValue: { [key: number]: string } = {};

for (const key in GameType) {
  if (isNaN(Number(key))) {
    const value = GameType[key as keyof typeof GameType];
    gameTypeByValue[value] = key;
  }
}

function getGameType(gameTypeId: number): string {
  if (!gameTypeByValue[gameTypeId]) {
    throw new NotFoundException(`Game with id ${gameTypeId} not found.`);
  }

  return gameTypeByValue[gameTypeId];
}

@Injectable()
export class SummonerService {
  constructor(
    @InjectRepository(SummonerEntity)
    private readonly summonerRepository: Repository<SummonerEntity>,
  ) { }

  async getAllSummoners(): Promise<SummonerEntity[]> {
    return await this.summonerRepository.find();
  }

  async getSummonerFromDB(
    name: string,
    region: string
  ) {
    const summonerInfo = await this.summonerRepository.findOne({
      where: { summonerName: name }
    });

    if (!summonerInfo || !summonerInfo.queueInfo || summonerInfo.queueInfo.length === 0) {
      return null;
    }

    const summonerFormattedInfo: SummonerInfo = {
      summonerName: summonerInfo.summonerName,
      profileIconId: summonerInfo.profileIconId,
      level: summonerInfo.level,
      region: region,
      puuid: summonerInfo.puuid,
      kda: summonerInfo.kda || 0,
      averageCsPerMinute: summonerInfo.minutesPlayed !== 0 ? summonerInfo.minionsKilled / summonerInfo.minutesPlayed : 0,
      averageVisionScore: summonerInfo.gamesPlayed !== 0 ? summonerInfo.totalVision / summonerInfo.gamesPlayed : 0,
      accountId: summonerInfo.accountId,
      queueInfo: summonerInfo.queueInfo.map(item => ({
        currentLeaguePoints: item.currentLeaguePoints,
        queueType: item.queueType,
        summonerRank: item.summonerRank,
        summonerTier: item.summonerTier,
        wins: item.wins,
        losses: item.losses
      }))
    };

    return summonerFormattedInfo;
  }

  private async saveSummonerInfoToDB(payload: SummonerInfo): Promise<void> {
    const queueInfoArray: QueueInfoItem[] = payload.queueInfo.map(
      (item) => ({
        currentLeaguePoints: item.currentLeaguePoints,
        queueType: item.queueType,
        summonerRank: item.summonerRank,
        summonerTier: item.summonerTier,
        wins: item.wins,
        losses: item.losses,
      }),
    );

    const summonerInfo: SummonerInfo = {
      ...payload,

      queueInfo: queueInfoArray,
    };

    console.log(summonerInfo);
    await this.summonerRepository.save(summonerInfo);
  }

  async getSummonerInfo(region: string, name: string): Promise<SummonerInfo> {
    region = region.toLowerCase();
    const summonerFromDB = await this.getSummonerFromDB(name, region);

    if (summonerFromDB) {
      return summonerFromDB;
    } else {
      console.log(
        `Summoner in region ${region} with name ${name} not found on db. Connecting to riot...`
      );
      return await this.getSummonerRiotConnection(region, name);
    }
  }

  async getSummonerRiotConnection(region: string, name: string): Promise<SummonerInfo> {
    const apiKeyRiot = process.env.API_KEY;
    const apiSummonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKeyRiot}`;

    try {
      const response = await axios.get(apiSummonerUrl);

      const summonerInfo: SummonerInfo = {
        summonerName: response.data.name,
        profileIconId: response.data.profileIconId,
        level: response.data.summonerLevel,
        region,
        puuid: response.data.puuid,
        accountId: response.data.accountId,
        kda: 0,
        averageCsPerMinute: 0,
        averageVisionScore: 0,
        queueInfo: null
      };

      const entriesApi = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${response.data.id}?api_key=${apiKeyRiot}`;

      const rankAndTierResponse = await axios.get(entriesApi);

      const summonerApiInfo: QueueInfoItem[] = [];

      for (const info of rankAndTierResponse.data) {
        const queueInfoItem: QueueInfoItem = {
          summonerRank: info.rank,
          summonerTier: info.tier,
          queueType: info.queueType,
          currentLeaguePoints: info.leaguePoints,
          wins: info.wins,
          losses: info.losses,
        };

        summonerApiInfo.push(queueInfoItem);
      }

      summonerInfo.queueInfo = summonerApiInfo;

      await this.saveSummonerInfoToDB(summonerInfo);

      return summonerInfo;
    } catch (error) {
      console.error('Error fetching summoner:', error);
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
      (item) => item.queueType === typeGame,
    );

    const filteredSummonerQueue: SummonerInfo = {
      ...summoners,
      queueInfo: (!filteredQueueInfo || filteredQueueInfo.length === 0) ? null : filteredQueueInfo,
    };

    return filteredSummonerQueue;
  }
}

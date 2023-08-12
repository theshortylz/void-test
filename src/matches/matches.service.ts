import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { RegionMapping } from 'src/utils/regionsTypes';
import { GameType } from 'src/utils/gameTypes';
import { InjectRepository } from '@nestjs/typeorm';
import { NumericType, Repository } from 'typeorm';
import { MatchEntity } from './matches.entity';
import { runesData } from 'src/utils/runes.types';
import { SummonerEntity } from 'src/summoner/summoner.entity';
dotenv.config();

function getGameType(gameTypeId: number): string {
  switch (gameTypeId) {
    case GameType.RANKED_SOLO_5x5:
      return 'Ranked Solo/Duo';
    case GameType.RANKED_FLEX_SR:
      return 'Ranked Flex';
    case GameType.NORMAL_SR:
      return 'Normal';
    case GameType.ARAM:
      return 'ARAM';
    case GameType.URF:
      return 'URF';
    case GameType.CHERRY:
      return 'SOUL_FIGHTER ';
    default:
      return 'Unknown';
  }
}

export interface SummonerInfo {
  summonerName: string;
  puuid: string;
}

export interface PlayerData {
  summonerName: string;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  csPerMinute: number;
  teamId: number;
  puuid: string;
  kda: string;
  primaryRunes: string[];
  secondaryRunes: string[];
  win: string;
}

export interface SimpleRune {
  id: number;
  name: string;
}

const runeIdToNameMap: { [key: number]: string } = {};
for (const rune of runesData.flatMap((rune) =>
  rune.slots.flatMap((slot) => slot.runes),
)) {
  runeIdToNameMap[rune.id] = rune.name;
}

@Injectable()
export class RiotApiService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(SummonerEntity)
    private readonly summonerRepository: Repository<SummonerEntity>,
  ) { }

  private getRegionName(regionCode: string): string {
    const regionName = RegionMapping[regionCode as keyof typeof RegionMapping];
    return regionName || 'Unknown';
  }

  async getMatches(region: string, name: string): Promise<MatchEntity[]> {
    const apiKeyRiot = process.env.API_KEY;
    const minMatches = 0;
    const maxMatches = 20;
    const apiSummonerUrl = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${apiKeyRiot}`;
    const regionName = this.getRegionName(region);
    const matchesSummonerUrl = `https://${regionName}.api.riotgames.com/lol/match/v5/matches/by-puuid`;

    try {
      const summonerResponse = await axios.get(apiSummonerUrl);
      const summonerPuuid = summonerResponse.data.puuid;
      const summonerMatchesUrl = `${matchesSummonerUrl}/${summonerPuuid}/ids?start=${minMatches}&count=${maxMatches}&api_key=${apiKeyRiot}`;

      const response = await axios.get(summonerMatchesUrl);
      const matchIds: string[] = response.data;

      const matches: MatchEntity[] = [];
      const summonerStats: SummonerEntity[] = [];

      for (const matchId of matchIds) {
        const savedMatches = await this.matchRepository.find({
          where: { idMatch: matchId },
        });

        if (savedMatches.length > 0) {
          matches.push(...savedMatches);
        } else {
          const matchUrl = `https://${regionName}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKeyRiot}`;
          const matchResponse = await axios.get(matchUrl);
          const matchData = matchResponse.data;

          const teamRedPlayers: PlayerData[] = [];
          const teamBluePlayers: PlayerData[] = [];
          const summoner: SummonerInfo[] = [];
          for (const participant of matchData.info.participants) {
            const kda = (
              (participant.kills + participant.assists) /
              Math.max(1, participant.deaths)
            ).toFixed(2);

            const primaryStyle = participant.perks.styles.find(
              (style: any) => style.description === 'primaryStyle',
            );

            const secondaryStyle = participant.perks.styles.find(
              (style: any) => style.description === 'subStyle',
            );

            const primaryRunes = primaryStyle?.selections.map(
              (selection: any) => {
                return {
                  id: selection.perk,
                  name: runeIdToNameMap[selection.perk],
                };
              },
            );

            const secondaryRunes = secondaryStyle?.selections.map(
              (selection: any) => {
                return {
                  id: selection.perk,
                  name: runeIdToNameMap[selection.perk],
                };
              },
            );

            const summonerEntity = await this.summonerRepository.findOne({
              where: { puuid: participant.puuid },
            });

            if (summonerEntity) {
              summonerEntity.kills += participant.kills;
              summonerEntity.deaths += participant.deaths;
              summonerEntity.assists += participant.assists;
              summonerEntity.totalVision += participant.visionScore;
              summonerEntity.minionsKilled += participant.totalMinionsKilled;
              summonerEntity.minutesPlayed += matchData.info.gameDuration;
              summonerEntity.gamesPlayed += 1;

              summonerEntity.kda =
                this.calculateKDA(
                  summonerEntity.kills,
                  summonerEntity.deaths,
                  summonerEntity.assists
                );

              await this.summonerRepository.save(summonerEntity);
            } else {
              const newSummonerEntity: SummonerEntity = {
                ...summonerEntity,
                puuid: participant.puuid,
                summonerName: participant.summonerName,
                kills: participant.kills,
                deaths: participant.deaths,
                assists: participant.assists,
                totalVision: participant.totalVisionScore,
                minionsKilled: participant.totalMinionsKilled,
                minutesPlayed: participant.gameDuration,
              }
              newSummonerEntity.kda = this.calculateKDA(
                newSummonerEntity.kills,
                newSummonerEntity.deaths,
                newSummonerEntity.kda
              );


              await this.summonerRepository.save(newSummonerEntity);
            }

            const playerData: PlayerData = {
              summonerName: participant.summonerName,
              championName: participant.championName,
              kills: participant.kills,
              deaths: participant.deaths,
              assists: participant.assists,
              csPerMinute: participant.totalMinionsKilled,
              teamId: participant.teamId,
              puuid: participant.puuid,
              kda: kda,
              primaryRunes: primaryRunes || [],
              secondaryRunes: secondaryRunes || [],
              win: participant.win,
            };

            if (participant.teamId === 100) {
              teamRedPlayers.push(playerData);
            } else if (participant.teamId === 200) {
              teamBluePlayers.push(playerData);
            }
          }

          const matchEntity = new MatchEntity();
          matchEntity.idMatch = matchId;
          matchEntity.teamIdRed = 100;
          matchEntity.teamIdBlue = 200;
          matchEntity.teamRedPlayers = teamRedPlayers;
          matchEntity.teamBluePlayers = teamBluePlayers;
          matchEntity.gameType = getGameType(matchData.info.queueId);
          matchEntity.gameTypeId = matchData.info.queueId;
          matchEntity.playersId = matchData.metadata.participants;

          await this.matchRepository.save(matchEntity);
          matches.push(matchEntity);
        }
      }

      const matchesJson: any[] = [];

      for (const match of matches) {
        const matchJson: any = {
          idMatch: match.idMatch,
          gameType: match.gameType,
          teamRedPlayers: match.teamRedPlayers.map((players) => players),
          teamBluePlayers: match.teamBluePlayers.map((players) => players),
          gameTypeId: match.gameTypeId,
        };
        matchesJson.push(matchJson);
      }

      return matchesJson;
    } catch (error) {
      console.error('Error fetching match data:', error);
      throw new Error('Error fetching match data');
    }
  }

  async getSummonerByNameWithQueueId(
    region: string,
    name: string,
    queueId: number,
  ): Promise<MatchEntity[]> {
    const matches = await this.getMatches(region, name);

    const filteredMatches = matches.filter(
      (match) => match.gameTypeId == queueId,
    );

    return filteredMatches;
  }

  private calculateKDA(kills: number, deaths: number, assists: number): number {
    const kda = (
      (kills + assists) /
      Math.max(1, deaths)
    ).toFixed(2);
    return parseFloat(kda);
  }
}

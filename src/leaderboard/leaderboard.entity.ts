import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export enum tiers {
  CHALLENGER = 'CHALLENGER',
  GRANDMASTER = 'GRANDMASTER',
  MASTER = 'MASTER',
  DIAMOND = 'DIAMOND',
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
  IRON = 'IRON',
}

export enum divisions {
  IV = 'IV',
  III = 'III',
  II = 'II',
  I = 'I'
}

@Entity()
export class LeaderboardEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  summonerName: string;

  @Column()
  @IsNumber()
  @IsPositive()
  wins: number;

  @Column()
  @IsNumber()
  @IsPositive()
  losses: number;

  @Column()
  @IsNumber()
  @IsPositive()
  leaguePoints: number;

  @Column()
  tier: tiers;

  @Column()
  rank: divisions;
}

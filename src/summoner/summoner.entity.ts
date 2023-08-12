import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

@Entity()
export class SummonerEntity {
  @IsNotEmpty()
  @IsString()
  @PrimaryColumn()
  summonerName: string;

  @IsString()
  @Column({ nullable: true })
  region: string;

  @IsString()
  @Column()
  @Column({ nullable: true })
  puuid: string;

  @IsString()
  @Column()
  @Column({ nullable: true })
  accountId: string;

  @IsString()
  @Column()
  @Column({ nullable: true })
  profileIconId: number;

  @IsNumber()
  @Column()
  @Column({ nullable: true })
  level: number;

  @IsString()
  @Column({ type: 'json', nullable: true })
  queueInfo: QueueInfoItem[];

  @Column({ nullable: true })
  @IsNumber()
  kills: number;

  @Column({ nullable: true })
  @IsNumber()
  deaths: number;

  @Column({ nullable: true })
  @IsNumber()
  assists: number;

  @Column({ nullable: true, type: 'float' })
  @IsNumber()
  kda: number;

  @IsNumber()
  @Column({ nullable: true })
  minutesPlayed: number;

  @Column({ nullable: true })
  @IsNumber()
  minionsKilled: number;

  @Column({ nullable: true })
  @IsNumber()
  totalVision: number;

  @IsPositive()
  @IsNumber()
  gamesPlayed: number;
}

interface QueueInfoItem {
  currentLeaguePoints: number;
  queueType: string;
  summonerRank: string;
  summonerTier: string;
  wins: number;
  losses: number;
}

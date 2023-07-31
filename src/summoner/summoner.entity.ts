import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SummonerEntity {
  @PrimaryColumn()
  summonerName: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  puuid: string;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  profileIconId: number;

  @Column({ nullable: true })
  summonerLevel: number;

  @Column({ type: 'json', nullable: true })
  queueInfo: QueueInfoItem[];

  @Column({ nullable: true })
  kills: number;

  @Column({ nullable: true })
  deaths: number;

  @Column({ nullable: true })
  assists: number;

  @Column({ nullable: true, type: 'float' })
  kda: number;
  
  @Column({ nullable: true })
  minutesPlayed: number;

  @Column({ nullable: true })
  minionsKilled: number;

  @Column({ nullable: true })
  totalVision: number;

  @Column({ default: 1, nullable: true })
  gamesPlayed: number;
}

interface QueueInfoItem {
  currentLeagepoints: number;
  queueType: string;
  summonerRank: string;
  summonerTier: string;
  wins: number;
  losses: number;
}

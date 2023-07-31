import { Entity, Column, PrimaryColumn } from 'typeorm';
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

@Entity()
export class MatchEntity {
  @PrimaryColumn()
  idMatch: string;

  @Column({ array: true, type: 'varchar' })
  playersId: string[];

  @Column('json', { nullable: true })
  teamRedPlayers: PlayerData[];

  @Column('json', { nullable: true })
  teamBluePlayers: PlayerData[];

  @Column()
  gameType: string;

  @Column()
  gameTypeId: number;

  @Column()
  teamIdRed: number;

  @Column()
  teamIdBlue: number;
}

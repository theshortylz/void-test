import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class LeaderboardEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  summoner: string
}

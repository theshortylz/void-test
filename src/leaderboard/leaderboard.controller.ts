import { Controller, Get, Param } from '@nestjs/common';
import { LeaderboradService, Leaderboard } from './leaderboard.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('leaderboard')
@ApiTags('Leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboradService) {}

  @Get('/:region/:name')
  async getLeaderboard(
    @Param('region') region: string,
    @Param('name') name: string,
  ): Promise<Leaderboard[]> {
    try {
      const leaderboard = await this.leaderboardService.getPlayersID(
        name,
        region,
      );
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('Error fetching leaderboard');
    }
  }
}

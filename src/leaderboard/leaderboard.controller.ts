import { Controller, Get, NotFoundException, Param, ValidationPipe } from '@nestjs/common';
import { LeaderboradService, Leaderboard } from './leaderboard.service';
import { divisions, tiers } from './leaderboard.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SummonerEntity } from 'src/summoner/summoner.entity';

@Controller('leaderboard')
@ApiTags('Leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboradService) { }

  @ApiOperation({
    summary: 'Get Ranked 5x5 Leaderboard',
    description: 'Retrieve the leaderboard for the RANKED_5X5 game mode based on tier and division.',
  })
  @Get('/:division/:tier')
  async getRanked5x5(
    @Param('division', new ValidationPipe()) division: divisions,
    @Param('tier', new ValidationPipe()) tier: tiers,
  ): Promise<Leaderboard[]> {
    return await this.leaderboardService.getLeaderboardRanked5x5(division, tier);
  }

  @ApiOperation({
    summary: 'Get KDA Leaderboard',
    description: 'Retrieve a KDA leaderboar based on their levels.',
  })
  @Get('/kda')
  async getKDA(): Promise<SummonerEntity[]> {
    const kda_Filter = await this.leaderboardService.filterSummonersByKDA();
    if (!kda_Filter || kda_Filter.length === 0) {
      throw new NotFoundException('Summoners without kda. Check if the values are not null or different of 0.');
    }
    return kda_Filter;
  }

  @ApiOperation({
    summary: 'Get Level-based Leaderboard',
    description: 'Retrieve a leaderboard of summoners based on their levels.',
  })
  @Get('/level')
  async get(): Promise<SummonerEntity[]> {
    const level_Filter = await this.leaderboardService.filterSummonersByLevel();
    if (!level_Filter || level_Filter.length === 0) {
      throw new NotFoundException('Summoners without level. Check if the values are not null or exist summoners.');
    }
    return level_Filter;
  }
}

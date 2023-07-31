import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RiotApiService } from './matches.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';

enum QueueId {
  RANKED_SOLO_5x5 = 420,
  RANKED_FLEX_SR = 440,
  NORMAL_SR = 5,
  ARAM = 450,
  URF = 900,
  CHERRY = 1700,
  RANKED_TFT_DOUBLE_UP = 1100,
  RANKED_TFT = 1100,
  NORMAL_BLIND_PICK = 430,
  NORMAL_DRAFT_PICK = 400,
}

@ApiTags('Matches') // Swagger tag for the controller
@Controller('matches')
export class MatchesController {
  constructor(private readonly riotApiService: RiotApiService) {}
  @Get(':region/:name')
  async getMatches(
    @Param('region') region: string,
    @Param('name') name: string,
    @Res() res: Response,
  ) {
    try {
      const matches = await this.riotApiService.getMatches(region, name);
      return res.json(matches);
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching match data' });
    }
  }
  @Get('/:region/:name/:queueId')
  @ApiParam({ name: 'region', enum: ['euw', 'na', 'kr', 'eune'] }) // Enum for region
  @ApiParam({ name: 'queueId', enum: QueueId }) // Enum for queueId
  async getMatchesById(
    @Param('region') region: string,
    @Param('name') name: string,
    @Param('queueId') queueId: number,
    @Res() res: Response,
  ) {
    try {
      const matches = await this.riotApiService.getSummonerByNameWithQueueId(
        region,
        name,
        queueId,
      );
      return res.json(matches);
    } catch (e) {
      console.log(e);
    }
  }
}

import { Controller, Get, Param, Res } from '@nestjs/common';
import { RiotApiService } from './matches.service';
import { Response } from 'express';

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

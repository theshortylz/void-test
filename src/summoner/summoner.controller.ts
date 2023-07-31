import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { SummonerService, SummonerInfo } from './summoner.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('summoner')
@ApiTags('Summoner')
export class SummonerController {
  constructor(private readonly summonerService: SummonerService) {}

  @ApiOperation({
    summary: 'Get summoner by ID',
    description: 'Retrieve user information by ID',
  })
  @Get('/:region/:name')
  async getSummonerByRegionAndName(
    @Param('region') region: string,
    @Param('name') name: string,
  ): Promise<SummonerInfo> {
    if (!region || !name) {
      throw new HttpException(
        'Region and name are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.summonerService.getSummonerInfo(region, name);
  }

  @ApiOperation({
    summary: 'Get summoner by QueueId',
    description: 'Retrieve user information by QueueID',
  })
  @Get('/:region/:name/:queueId')
  async getSummonerFiltered(
    @Param('region') region: string,
    @Param('name') name: string,
    @Param('queueId') queueId: number,
  ): Promise<SummonerInfo> {
    if (!region || !name || !queueId) {
      throw new HttpException(
        'Region, name, and queueId are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const infoArray = await this.summonerService.getInfoByQueue(
      region,
      name,
      queueId,
    );
    return infoArray;
  }
}

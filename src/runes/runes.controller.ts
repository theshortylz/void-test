// import { Controller, Get } from '@nestjs/common';
// import { RunasService } from './runes.service';

// @Controller('runes')
// export class RunasController {
//   constructor(private readonly runasService: RunasService) {}

//   @Get('/')
//   async getRunesData() {
//     try {
//       const version = '11.15.1';
//       const locale = 'en_US';

//       const runesData = await this.runasService.searchRunesDataDragon(
//         version,
//         locale,
//       );

//       return runesData;
//     } catch (error) {
//       console.error('Error fetching runes data:', error);
//       throw new Error('Error fetching runes data');
//     }
//   }
// }

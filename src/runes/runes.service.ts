// import { Injectable } from '@nestjs/common';
// import axios from 'axios';

// export interface RuneInfo {
//   id: number;
//   name: string;
//   icon: string;
//   runes: {}[];
// }

// @Injectable()
// export class RunasService {
//   async searchRunesDataDragon(
//     version: string,
//     locale: string,
//   ): Promise<RuneInfo[]> {
//     const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/runesReforged.json`;

//     try {
//       const response = await axios.get<RuneInfo[]>(url);
//       const runesData: RuneInfo[] = response.data.map((rune) => ({
//         id: rune.id,
//         name: rune.name,
//         icon: rune.icon,
//         runes: rune.slots.flatMap((slot) => ({})),
//       }));
//       return runesData;
//     } catch (error) {
//       console.error('Error fetching runes data:', error);
//       throw new Error('Error fetching runes data');
//     }
//   }
// }

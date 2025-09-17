import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const DrakkariEmbalmer: BattlecryCard = {
	cardIds: [CardIds.DrakkariEmbalmer_BG26_RLK_119, CardIds.DrakkariEmbalmer_BG26_RLK_119_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === CardIds.DrakkariEmbalmer_BG26_RLK_119_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = input.board
				.filter((e) =>
					hasCorrectTribe(e, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards),
				)
				.filter((e) => !e.reborn);
			const target = pickRandom(candidates);
			if (!!target) {
				updateReborn(target, true, input.board, input.hero, input.otherHero, input.gameState);
			}
		}
		return true;
	},
};

import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard } from '../../card.interface';

export const SnackVendor: EndOfTurnCard = {
	cardIds: [CardIds.SnackVendor_TB_BaconShop_HERO_16_Buddy, CardIds.SnackVendor_TB_BaconShop_HERO_16_Buddy],
	endOfTurn: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.SnackVendor_TB_BaconShop_HERO_16_Buddy ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const candidates = input.board.filter(
				(e) =>
					!SnackVendor.cardIds.includes(e.cardId) &&
					input.gameState.allCards.getCard(e.cardId).techLevel === 3,
			);
			const target = pickRandom(candidates);
			if (target) {
				modifyStats(target, minion, minion.attack, minion.maxHealth, input.board, input.hero, input.gameState);
			}
		}
	},
};

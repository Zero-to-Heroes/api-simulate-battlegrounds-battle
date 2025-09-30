import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Weebomination: EndOfTurnCard = {
	cardIds: [CardIds.Weebomination_TB_BaconShop_HERO_34_Buddy, CardIds.Weebomination_TB_BaconShop_HERO_34_Buddy_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const maxHealth = input.gameState.allCards.getCard(CardIds.Patchwerk_TB_BaconShop_HERO_34).health ?? 30;
		const missingHealth = maxHealth - input.hero.hpLeft;
		const index = input.board.findIndex((e) => e === minion);
		const leftNeighbor = index - 1 >= 0 ? input.board[index - 1] : null;
		const neighbors =
			minion.cardId === CardIds.Weebomination_TB_BaconShop_HERO_34_Buddy_G
				? getNeighbours(input.board, minion)
				: [leftNeighbor];
		for (const neighbor of neighbors) {
			modifyStats(neighbor, minion, 0, missingHealth, input.board, input.hero, input.gameState);
		}
	},
};

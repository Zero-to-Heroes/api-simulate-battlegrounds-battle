import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { modifyStats } from '../../../simulation/stats';
import { getRandomAliveMinion } from '../../../utils';
import { OnCardAddedToHandCard } from '../../card.interface';

export const PeggySturdybone: OnCardAddedToHandCard = {
	cardIds: [CardIds.PeggySturdybone_BG25_032, CardIds.PeggySturdybone_BG25_032_G],
	onCardAddedToHand: (minion: BoardEntity, input: OnCardAddedToHandInput) => {
		const pirate = getRandomAliveMinion(
			input.board.filter((e) => e.entityId !== minion.entityId),
			input.hero,
			Race.PIRATE,
			input.gameState,
		);
		if (pirate) {
			modifyStats(
				pirate,
				minion,
				minion.cardId === CardIds.PeggySturdybone_BG25_032_G ? 2 : 1,
				minion.cardId === CardIds.PeggySturdybone_BG25_032_G ? 2 : 1,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};

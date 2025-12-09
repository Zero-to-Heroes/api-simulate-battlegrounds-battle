import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe, isGolden } from '../../../utils';
import { OnCardAddedToHandCard } from '../../card.interface';

export const DastardlyDrust: OnCardAddedToHandCard = {
	cardIds: [CardIds.DastardlyDrust_BG32_234, CardIds.DastardlyDrust_BG32_234_G],
	onCardAddedToHand: (minion: BoardEntity, input: OnCardAddedToHandInput) => {
		if (
			hasCorrectTribe(
				input.addedCard,
				input.hero,
				Race.PIRATE,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			const mult = minion.cardId === CardIds.DastardlyDrust_BG32_234_G ? 2 : 1;
			const targets = input.board;
			for (const target of targets) {
				if (isGolden(target.cardId, input.gameState.allCards)) {
					modifyStats(target, minion, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
				} else {
					modifyStats(target, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
				}
			}
		}
	},
};

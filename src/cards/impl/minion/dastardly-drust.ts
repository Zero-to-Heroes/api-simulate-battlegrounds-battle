import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe, isGolden } from '../../../utils';
import { OnCardAddedToHandCard } from '../../card.interface';

export const DastardlyDrust: OnCardAddedToHandCard = {
	cardIds: [TempCardIds.DastardlyDrust, TempCardIds.DastardlyDrust_G],
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
			const mult = minion.cardId === TempCardIds.DastardlyDrust_G ? 2 : 1;
			const targets = input.board.filter((e) => e.entityId !== minion.entityId);
			for (const target of targets) {
				const buff = isGolden(target.cardId, input.gameState.allCards) ? 2 * mult : 1 * mult;
				modifyStats(target, minion, 1 * buff, 1 * buff, input.board, input.hero, input.gameState);
			}
		}
	},
};

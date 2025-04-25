import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEffectCard } from '../../card.interface';

export const CoilskarSapper: DeathrattleEffectCard = {
	cardIds: [TempCardIds.CoilskarSapper, TempCardIds.CoilskarSapper_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.CoilskarSapper_G ? 2 : 1;
		const cardsToAdd = Array(2 * mult).fill(null);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};

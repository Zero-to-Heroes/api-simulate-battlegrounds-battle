import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEffectCard } from '../../card.interface';

export const SlumberSorcerer: DeathrattleEffectCard = {
	cardIds: [TempCardIds.SlumberSorcerer, TempCardIds.SlumberSorcerer_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.SlumberSorcerer_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.ShiftingTide);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
	},
};

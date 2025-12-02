import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedSapper: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedSapper_BG34_Giant_304, CardIds.TimewarpedSapper_BG34_Giant_304_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSapper_BG34_Giant_304_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.SpitescaleSpecial_BG28_606);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

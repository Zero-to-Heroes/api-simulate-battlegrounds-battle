import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const SlumberSorcerer: DeathrattleSpawnCard = {
	cardIds: [CardIds.SlumberSorcerer_BG32_833, CardIds.SlumberSorcerer_BG32_833_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SlumberSorcerer_BG32_833_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.ShiftingTide_BG32_815);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CoilskarSapper: DeathrattleSpawnCard = {
	cardIds: [CardIds.CoilskarSapper_BG32_836, CardIds.CoilskarSapper_BG32_836_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.CoilskarSapper_BG32_836_G ? 2 : 1;
		const cardsToAdd = Array(2 * mult).fill(null);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

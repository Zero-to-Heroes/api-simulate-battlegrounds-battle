import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Shadowdancer: DeathrattleSpawnCard = {
	cardIds: [CardIds.Shadowdancer_BG32_891, CardIds.Shadowdancer_BG32_891_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.Shadowdancer_BG32_891_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.StaffOfEnrichment_BG28_886);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Zippers: DeathrattleSpawnCard = {
	cardIds: [CardIds.Zippers_BG32_HERO_002_Buddy, CardIds.Zippers_BG32_HERO_002_Buddy_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.Zippers_BG32_HERO_002_Buddy_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			// Simulate "helpful" during combat
			const cardToAdd = input.gameState.cardsData.getRandomMinionForMinTavernTier(
				input.boardWithDeadEntityHero.tavernTier,
			);
			addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, [cardToAdd], input.gameState);
		}
		return [];
	},
};

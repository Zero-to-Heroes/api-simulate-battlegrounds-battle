import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CarapaceRaiser: DeathrattleSpawnCard = {
	cardIds: [CardIds.CarapaceRaiser_BG33_111, CardIds.CarapaceRaiser_BG33_111_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.CarapaceRaiser_BG33_111_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.HauntedCarapace_BG33_112);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

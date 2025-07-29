import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CarapaceRaiser: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.CarapaceRaiser, TempCardIds.CarapaceRaiser_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.CarapaceRaiser_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.HauntedCarapace);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

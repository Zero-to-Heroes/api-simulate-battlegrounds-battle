import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const WintergraspGhoul: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.WintergraspGhoul, TempCardIds.WintergraspGhoul_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.WintergraspGhoul_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.TombTurning);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

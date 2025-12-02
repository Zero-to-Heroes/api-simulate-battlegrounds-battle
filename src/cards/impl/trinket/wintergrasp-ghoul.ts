import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const WintergraspGhoul: DeathrattleSpawnCard = {
	cardIds: [CardIds.WintergraspGhoul_BG34_694, CardIds.WintergraspGhoul_BG34_694_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.WintergraspGhoul_BG34_694_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TombTurning_BG34_888);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

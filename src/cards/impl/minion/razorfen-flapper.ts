import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const RazorfenFlapper: DeathrattleSpawnCard = {
	cardIds: [CardIds.RazorfenFlapper_BG34_682, CardIds.RazorfenFlapper_BG34_682_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.RazorfenFlapper_BG34_682_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGemBarrage_BG34_689);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

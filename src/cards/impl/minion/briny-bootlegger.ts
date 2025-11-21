import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const BrinyBootlegger: DeathrattleSpawnCard = {
	cardIds: [CardIds.BrinyBootlegger_BG21_017, CardIds.BrinyBootlegger_BG21_017_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.BrinyBootlegger_BG21_017_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TavernCoin_BG28_810);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};

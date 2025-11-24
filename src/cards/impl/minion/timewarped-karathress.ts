import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedKarathress: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.TimewarpedKarathress, TempCardIds.TimewarpedKarathress_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedKarathress_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};

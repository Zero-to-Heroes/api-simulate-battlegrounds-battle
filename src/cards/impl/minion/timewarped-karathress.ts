import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedKarathress: AfterOtherSpawnedCard = {
	cardIds: [CardIds.TimewarpedKarathress_BG34_PreMadeChamp_056, CardIds.TimewarpedKarathress_BG34_PreMadeChamp_056_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedKarathress_BG34_PreMadeChamp_056_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};

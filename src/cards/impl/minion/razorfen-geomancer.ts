import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const RazorfenGeomancer: BattlecryCard = {
	cardIds: [CardIds.RazorfenGeomancer_BG20_100, CardIds.RazorfenGeomancer_BG20_100_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const razorFenCardsToAdd =
			minion.cardId === CardIds.RazorfenGeomancer_BG20_100
				? [CardIds.BloodGem]
				: [CardIds.BloodGem, CardIds.BloodGem];
		addCardsInHand(input.hero, input.board, razorFenCardsToAdd, input.gameState);
	},
};

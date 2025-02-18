import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const Mothership: AvengeCard = {
	cardIds: [CardIds.WarpGate_MothershipToken_BG31_HERO_802pt7, CardIds.Mothership_BG31_HERO_802pt7_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput): void => {
		const cards = minion.cardId === CardIds.Mothership_BG31_HERO_802pt7_G ? 2 : 1;
		const cardsAdded = Array(cards).map(() =>
			input.gameState.cardsData.getRandomProtossMinion(input.hero.tavernTier),
		);
		addCardsInHand(input.hero, input.board, cardsAdded, input.gameState);
	},
};

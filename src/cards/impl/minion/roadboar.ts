import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const Roadboar: RallyCard = {
	cardIds: [CardIds.Roadboar_BG20_101, CardIds.Roadboar_BG20_101_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.Roadboar_BG20_101_G ? 2 : 1;
		const cardsToAdd = Array(2 * mult).fill(CardIds.BloodGem);
		addCardsInHand(input.attackingHero, input.attackingBoard, cardsToAdd, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};

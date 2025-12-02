import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const TimewarpedVaelastrasz: RallyCard = {
	cardIds: [CardIds.TimewarpedVaelastrasz_BG34_Giant_585, CardIds.TimewarpedVaelastrasz_BG34_Giant_585_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.TimewarpedVaelastrasz_BG34_Giant_585_G ? 2 : 1;
		const addedCards = Array(mult).map(() => input.gameState.cardsData.getRandomMinionForTribe(Race.DRAGON, 6));
		addCardsInHand(input.attackingHero, input.attackingBoard, addedCards, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};

import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const Vaelastrasz: RallyCard = {
	cardIds: [CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy, CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.Vaelastrasz_TB_BaconShop_HERO_56_Buddy_G ? 2 : 1;
		const addedCards: string[] = [];
		for (let i = 0; i < mult; i++) {
			addedCards.push(input.gameState.cardsData.getRandomMinionForTribe(Race.DRAGON, 6));
		}
		addCardsInHand(input.attackingHero, input.attackingBoard, addedCards, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};

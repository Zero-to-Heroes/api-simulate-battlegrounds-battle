import { BoardEntity } from './board-entity';
import { AllCardsService } from './cards/cards';

export const buildBoardEntity = (cardId: string, allCards: AllCardsService, entityId: number = 1): BoardEntity => {
	const card = allCards.getCard(cardId);
	return {
		attack: card.attack,
		attacksPerformed: 0,
		cardId: cardId,
		divineShield: card.mechanics && card.mechanics.indexOf('DIVINE_SHIELD') !== -1,
		enchantmentsCardIds: [] as readonly string[],
		entityId: entityId,
		health: card.health,
		taunt: card.mechanics && card.mechanics.indexOf('TAUNT') !== -1,
	} as BoardEntity;
};

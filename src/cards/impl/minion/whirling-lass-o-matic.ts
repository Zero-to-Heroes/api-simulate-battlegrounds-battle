import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const WhirlingLassOMatic: RallyCard = {
	cardIds: [CardIds.WhirlingLassOMatic_BG28_635, CardIds.WhirlingLassOMatic_BG28_635_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const numberOfCardsToAdd = input.attacker.cardId === CardIds.WhirlingLassOMatic_BG28_635_G ? 2 : 1;
		const cardsToAdd = Array.from({ length: numberOfCardsToAdd }).map(() =>
			input.gameState.cardsData.getRandomTavernSpell({ maxTavernTier: input.attackingHero.tavernTier ?? 6 }),
		);
		addCardsInHand(input.attackingHero, input.attackingBoard, cardsToAdd, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};

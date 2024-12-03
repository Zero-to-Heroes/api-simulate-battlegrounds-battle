import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const NeonAgent: OnAttackCard = {
	cardIds: [CardIds.NeonAgent_BG31_146, CardIds.NeonAgent_BG31_146_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const cards = [];
		const numberOfCards = minion.cardId === CardIds.NeonAgent_BG31_146_G ? 2 : 1;
		for (let i = 0; i < numberOfCards; i++) {
			cards.push(pickRandom(input.gameState.cardsData.battlecryMinions));
		}
		addCardsInHand(input.attackingHero, input.attackingBoard, cards, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
